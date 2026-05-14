# AutomationSystem.gd
# Manages automation upgrades and their monthly benefits.
# Autoload singleton: AutomationSystem

extends Node

## All automation upgrade definitions
var all_automation_upgrades: Array[Dictionary] = []

## Purchased automation upgrade IDs
var purchased_automation: Array[String] = []


func _ready() -> void:
	_load_automation_upgrades()
	EventBus.month_advanced.connect(_on_month_advanced)


func _load_automation_upgrades() -> void:
	"""Load automation upgrade definitions from JSON."""
	var data = DataLoader.load_json("res://data/automation_upgrades.json")
	if data == null or not data.has("automation_upgrades"):
		push_error("[AutomationSystem] Failed to load automation_upgrades.json")
		return
	all_automation_upgrades.clear()
	for a in data["automation_upgrades"]:
		all_automation_upgrades.append(a)


func get_all_automation_upgrades() -> Array[Dictionary]:
	return all_automation_upgrades


func get_available_automation() -> Array[Dictionary]:
	"""Return automation upgrades that can be purchased."""
	var result: Array[Dictionary] = []
	for auto_up in all_automation_upgrades:
		if _is_available(auto_up):
			result.append(auto_up)
	return result


func can_purchase(auto_id: String) -> bool:
	var auto_up = _get_automation(auto_id)
	if auto_up.is_empty():
		return false
	return _is_available(auto_up)


func purchase_automation(auto_id: String) -> bool:
	"""Purchase an automation upgrade. Returns true if successful."""
	var auto_up = _get_automation(auto_id)
	if auto_up.is_empty() or not _is_available(auto_up):
		return false
	
	var costs = auto_up.get("cost", {})
	if not ResourceSystem.spend_multiple(costs):
		return false
	
	# Mark as purchased
	purchased_automation.append(auto_id)
	
	# Apply automation gain
	var auto_gain = float(auto_up.get("automation_gain", 0))
	if auto_gain > 0:
		ResourceSystem.add_resource("automation", auto_gain)
	
	# Apply immediate effects
	var effects = auto_up.get("effects", {})
	if not effects.is_empty():
		ResourceSystem.apply_effects(effects)
	
	EventBus.upgrade_purchased.emit(auto_id)
	EventBus.resources_updated.emit()
	EventBus.log_message.emit("Automation: %s activated!" % auto_up.get("name", auto_id))
	
	return true


func _on_month_advanced(_new_month: int) -> void:
	"""Apply monthly benefits from purchased automation upgrades."""
	for auto_id in purchased_automation:
		var auto_up = _get_automation(auto_id)
		if auto_up.is_empty():
			continue
		
		# Apply monthly benefits based on ID
		match auto_id:
			"automated_marketing":
				ResourceSystem.add_resource("hype", 2)
			"product_analytics_agent":
				ResourceSystem.add_resource("data", 5)
			"model_optimization_pipeline":
				ResourceSystem.add_resource("compute", 10)
			"autonomous_sales_agent":
				ResourceSystem.add_resource("cash", 1000)


func _is_available(auto_up: Dictionary) -> bool:
	"""Check if an automation upgrade is available."""
	if purchased_automation.has(auto_up["id"]):
		return false
	
	var reqs = auto_up.get("requirements", {})
	
	if reqs.has("min_automation"):
		if GameState.automation < float(reqs["min_automation"]):
			return false
	if reqs.has("min_month"):
		if GameState.current_month < int(reqs["min_month"]):
			return false
	if reqs.has("min_talent"):
		if GameState.talent < float(reqs["min_talent"]):
			return false
	if reqs.has("min_products"):
		if ProductSystem.active_products.size() < int(reqs["min_products"]):
			return false
	if reqs.has("min_trust"):
		if GameState.trust < float(reqs["min_trust"]):
			return false
	
	var costs = auto_up.get("cost", {})
	return ResourceSystem.can_afford(costs)


func _get_automation(auto_id: String) -> Dictionary:
	for auto_up in all_automation_upgrades:
		if auto_up["id"] == auto_id:
			return auto_up
	return {}
