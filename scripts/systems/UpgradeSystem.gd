# UpgradeSystem.gd
# Manages research, infrastructure, safety, marketing, and other upgrades.
# Autoload singleton: UpgradeSystem

extends Node

## All upgrade definitions
var all_upgrades: Array[Dictionary] = []


func _ready() -> void:
	_load_upgrades()


func _load_upgrades() -> void:
	"""Load upgrade definitions from JSON."""
	var data = DataLoader.load_json("res://data/upgrades.json")
	if data == null or not data.has("upgrades"):
		push_error("[UpgradeSystem] Failed to load upgrades.json")
		return
	all_upgrades.clear()
	for u in data["upgrades"]:
		all_upgrades.append(u)


func get_all_upgrades() -> Array[Dictionary]:
	return all_upgrades


func get_available_upgrades() -> Array[Dictionary]:
	"""Return upgrades that can be purchased."""
	var result: Array[Dictionary] = []
	for upgrade in all_upgrades:
		if _is_available(upgrade):
			result.append(upgrade)
	return result


func get_locked_upgrades() -> Array[Dictionary]:
	"""Return upgrades that cannot be purchased yet."""
	var result: Array[Dictionary] = []
	for upgrade in all_upgrades:
		if not _is_purchased(upgrade) and not _is_available(upgrade):
			result.append(upgrade)
	return result


func can_purchase(upgrade_id: String) -> bool:
	var upgrade = _get_upgrade(upgrade_id)
	if upgrade.is_empty():
		return false
	return _is_available(upgrade)


func purchase_upgrade(upgrade_id: String) -> bool:
	"""Purchase an upgrade. Returns true if successful."""
	var upgrade = _get_upgrade(upgrade_id)
	if upgrade.is_empty() or not _is_available(upgrade):
		return false
	
	var costs = upgrade.get("cost", {})
	if not ResourceSystem.spend_multiple(costs):
		return false
	
	# Mark as purchased
	GameState.purchased_upgrades.append(upgrade_id)
	
	# Apply effects
	var effects = upgrade.get("effects", {})
	if not effects.is_empty():
		ResourceSystem.apply_effects(effects)
	
	EventBus.upgrade_purchased.emit(upgrade_id)
	EventBus.resources_updated.emit()
	EventBus.log_message.emit("Purchased: %s" % upgrade.get("name", upgrade_id))
	
	return true


func _is_available(upgrade: Dictionary) -> bool:
	"""Check if an upgrade is available for purchase."""
	# Check if already purchased (one-time)
	if _is_purchased(upgrade):
		return false
	
	# Check requirements
	var reqs = upgrade.get("requirements", {})
	
	if reqs.has("min_month"):
		if GameState.current_month < int(reqs["min_month"]):
			return false
	if reqs.has("min_trust"):
		if GameState.trust < float(reqs["min_trust"]):
			return false
	if reqs.has("min_users"):
		if GameState.users < float(reqs["min_users"]):
			return false
	if reqs.has("min_talent"):
		if GameState.talent < float(reqs["min_talent"]):
			return false
	if reqs.has("min_products"):
		if ProductSystem.active_products.size() < int(reqs["min_products"]):
			return false
	
	# Check can afford
	var costs = upgrade.get("cost", {})
	return ResourceSystem.can_afford(costs)


func _is_purchased(upgrade: Dictionary) -> bool:
	"""Check if an upgrade has already been purchased."""
	var is_one_time = upgrade.get("one_time", true)
	if is_one_time and GameState.purchased_upgrades.has(upgrade["id"]):
		return true
	return false


func _get_upgrade(upgrade_id: String) -> Dictionary:
	for upgrade in all_upgrades:
		if upgrade["id"] == upgrade_id:
			return upgrade
	return {}
