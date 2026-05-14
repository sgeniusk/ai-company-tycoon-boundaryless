# ProductSystem.gd
# Manages product loading, launching, revenue, and user generation.
# Autoload singleton: ProductSystem

extends Node

## All product definitions loaded from JSON
var all_products: Array[Dictionary] = []

## Currently active (launched) product IDs
var active_products: Array[String] = []


func _ready() -> void:
	_load_products()
	EventBus.month_advanced.connect(_on_month_advanced)


func _load_products() -> void:
	"""Load product definitions from JSON."""
	var data = DataLoader.load_json("res://data/products.json")
	if data == null or not data.has("products"):
		push_error("[ProductSystem] Failed to load products.json")
		return
	all_products.clear()
	for p in data["products"]:
		all_products.append(p)


func get_all_products() -> Array[Dictionary]:
	return all_products


func get_active_products() -> Array[Dictionary]:
	"""Return full data for all active products."""
	var result: Array[Dictionary] = []
	for product in all_products:
		if active_products.has(product["id"]):
			result.append(product)
	return result


func get_available_products() -> Array[Dictionary]:
	"""Return products that can be launched (requirements met, not active)."""
	var result: Array[Dictionary] = []
	for product in all_products:
		if active_products.has(product["id"]):
			continue
		if can_launch(product["id"]):
			result.append(product)
	return result


func get_locked_products() -> Array[Dictionary]:
	"""Return products that cannot be launched yet."""
	var result: Array[Dictionary] = []
	for product in all_products:
		if active_products.has(product["id"]):
			continue
		if not can_launch(product["id"]):
			result.append(product)
	return result


func can_launch(product_id: String) -> bool:
	"""Check if a product can be launched (all requirements met)."""
	var product = _get_product(product_id)
	if product.is_empty():
		return false
	if active_products.has(product_id):
		return false
	
	# Check domain unlocked
	var domain = product.get("domain", "")
	if domain != "" and not GameState.unlocked_domains.has(domain):
		return false
	
	# Check capability requirements
	var req_caps = product.get("required_capabilities", {})
	for cap_id in req_caps:
		var required_level = int(req_caps[cap_id])
		var current_level = GameState.unlocked_capabilities.get(cap_id, 0)
		if current_level < required_level:
			return false
	
	# Check trust requirement
	var trust_req = float(product.get("trust_requirement", 0))
	if GameState.trust < trust_req:
		return false
	
	# Check can afford launch cost
	var costs = product.get("launch_cost", {})
	if not ResourceSystem.can_afford(costs):
		return false
	
	return true


func get_lock_reason(product_id: String) -> String:
	"""Return a human-readable reason why a product is locked."""
	var product = _get_product(product_id)
	if product.is_empty():
		return "Product not found."
	if active_products.has(product_id):
		return "Already launched."
	
	var reasons: Array[String] = []
	
	# Domain check
	var domain = product.get("domain", "")
	if domain != "" and not GameState.unlocked_domains.has(domain):
		reasons.append("Domain '%s' not unlocked" % domain)
	
	# Capability check
	var req_caps = product.get("required_capabilities", {})
	for cap_id in req_caps:
		var required_level = int(req_caps[cap_id])
		var current_level = GameState.unlocked_capabilities.get(cap_id, 0)
		if current_level < required_level:
			reasons.append("Need %s Lv.%d (have Lv.%d)" % [cap_id.capitalize(), required_level, current_level])
	
	# Trust check
	var trust_req = float(product.get("trust_requirement", 0))
	if GameState.trust < trust_req:
		reasons.append("Need Trust %d (have %d)" % [int(trust_req), int(GameState.trust)])
	
	# Cost check
	var costs = product.get("launch_cost", {})
	if not ResourceSystem.can_afford(costs):
		reasons.append("Cannot afford launch cost")
	
	if reasons.is_empty():
		return "Ready to launch!"
	return "; ".join(reasons)


func launch_product(product_id: String) -> bool:
	"""Launch a product. Returns true if successful."""
	if not can_launch(product_id):
		return false
	
	var product = _get_product(product_id)
	var costs = product.get("launch_cost", {})
	
	# Spend resources
	if not ResourceSystem.spend_multiple(costs):
		return false
	
	# Add to active
	active_products.append(product_id)
	GameState.active_products = active_products.duplicate()
	
	# Apply launch hype
	var hype_bonus = float(product.get("hype_on_launch", 0))
	if hype_bonus > 0:
		ResourceSystem.add_resource("hype", hype_bonus)
	
	# Emit signals
	EventBus.product_launched.emit(product_id)
	EventBus.resources_updated.emit()
	EventBus.log_message.emit("Launched: %s!" % product.get("name", product_id))
	
	return true


func _on_month_advanced(_new_month: int) -> void:
	"""Apply monthly product effects: revenue, users, data, compute cost."""
	var total_revenue: float = 0.0
	var total_new_users: float = 0.0
	var total_data: float = 0.0
	var total_compute_cost: float = 0.0
	
	var balance = DataLoader.load_balance()
	var hype_mult = 1.0 + (GameState.hype / 100.0) * float(balance.get("hype_growth_multiplier", 1.02) - 1.0) * 10.0
	var trust_mult = 1.0
	if GameState.trust > float(balance.get("trust_multiplier_high_threshold", 70)):
		trust_mult = float(balance.get("trust_enterprise_bonus", 1.5))
	elif GameState.trust < float(balance.get("trust_multiplier_low_threshold", 30)):
		trust_mult = float(balance.get("trust_low_penalty", 0.5))
	
	for product_id in active_products:
		var product = _get_product(product_id)
		if product.is_empty():
			continue
		
		var level = float(product.get("level", 1))
		var base_rev = float(product.get("base_revenue", 0))
		var base_users = float(product.get("base_users_per_month", 0))
		var data_gen = float(product.get("data_generated_per_month", 0))
		var compute_per_k = float(product.get("compute_per_1000_users", 0))
		
		# Revenue
		var is_enterprise = product.get("tags", []).has("enterprise")
		var product_trust_mult = trust_mult if is_enterprise else 1.0
		var revenue = base_rev * level * product_trust_mult
		total_revenue += revenue
		
		# Users
		var new_users = base_users * hype_mult
		total_new_users += new_users
		
		# Data
		total_data += data_gen
		
		# Compute cost
		total_compute_cost += (GameState.users / 1000.0) * compute_per_k * 0.1
	
	# Apply effects
	if total_revenue > 0:
		ResourceSystem.add_resource("cash", total_revenue)
	if total_new_users > 0:
		ResourceSystem.add_resource("users", total_new_users)
	if total_data > 0:
		ResourceSystem.add_resource("data", total_data)
	if total_compute_cost > 0:
		ResourceSystem.add_resource("compute", -total_compute_cost)


func _get_product(product_id: String) -> Dictionary:
	"""Find a product by ID."""
	for product in all_products:
		if product["id"] == product_id:
			return product
	return {}
