# CapabilitySystem.gd
# Manages AI capability loading, upgrading, and domain unlocking.
# Autoload singleton: CapabilitySystem

extends Node

## All capability definitions
var all_capabilities: Array[Dictionary] = []


func _ready() -> void:
	_load_capabilities()
	_initialize_starting_capabilities()


func _load_capabilities() -> void:
	"""Load capability definitions from JSON."""
	var data = DataLoader.load_json("res://data/capabilities.json")
	if data == null or not data.has("capabilities"):
		push_error("[CapabilitySystem] Failed to load capabilities.json")
		return
	all_capabilities.clear()
	for c in data["capabilities"]:
		all_capabilities.append(c)


func _initialize_starting_capabilities() -> void:
	"""Set starting capability levels (all at 0 except language at 1)."""
	if GameState.unlocked_capabilities.is_empty():
		GameState.unlocked_capabilities = {"language": 1}


func get_all_capabilities() -> Array[Dictionary]:
	return all_capabilities


func get_capability_level(cap_id: String) -> int:
	return int(GameState.unlocked_capabilities.get(cap_id, 0))


func can_upgrade(cap_id: String) -> bool:
	"""Check if a capability can be upgraded."""
	var cap = _get_capability(cap_id)
	if cap.is_empty():
		return false
	
	var current_level = get_capability_level(cap_id)
	var max_level = int(cap.get("max_level", 1))
	if current_level >= max_level:
		return false
	
	# Check cost
	var costs = _get_upgrade_cost(cap, current_level)
	if costs.is_empty():
		return false
	
	return ResourceSystem.can_afford(costs)


func get_upgrade_cost(cap_id: String) -> Dictionary:
	"""Get the cost to upgrade a capability to the next level."""
	var cap = _get_capability(cap_id)
	if cap.is_empty():
		return {}
	var current_level = get_capability_level(cap_id)
	return _get_upgrade_cost(cap, current_level)


func upgrade_capability(cap_id: String) -> bool:
	"""Upgrade a capability. Returns true if successful."""
	if not can_upgrade(cap_id):
		return false
	
	var cap = _get_capability(cap_id)
	var current_level = get_capability_level(cap_id)
	var costs = _get_upgrade_cost(cap, current_level)
	
	if not ResourceSystem.spend_multiple(costs):
		return false
	
	# Increase level
	var new_level = current_level + 1
	GameState.unlocked_capabilities[cap_id] = new_level
	
	# Apply per-level effects (e.g., safety gives trust, optimization gives compute)
	var effects = cap.get("effects_per_level", {})
	if not effects.is_empty():
		ResourceSystem.apply_effects(effects)
	
	# Check domain unlocks
	_check_domain_unlocks(cap_id, new_level, cap)
	
	# Emit signals
	EventBus.capability_upgraded.emit(cap_id, new_level)
	EventBus.resources_updated.emit()
	EventBus.log_message.emit("Upgraded %s to Level %d!" % [cap.get("name", cap_id), new_level])
	
	return true


func _check_domain_unlocks(cap_id: String, new_level: int, cap: Dictionary) -> void:
	"""Check if upgrading this capability unlocks any domains."""
	var unlocks = cap.get("unlocks_domains", {})
	var level_str = str(new_level)
	if unlocks.has(level_str):
		var domain_id = unlocks[level_str]
		DomainSystem.try_unlock_domain(domain_id)


func _get_upgrade_cost(cap: Dictionary, current_level: int) -> Dictionary:
	"""Get upgrade cost for the next level."""
	var costs_array = cap.get("upgrade_costs", [])
	if current_level >= costs_array.size():
		return {}
	return costs_array[current_level]


func _get_capability(cap_id: String) -> Dictionary:
	for cap in all_capabilities:
		if cap["id"] == cap_id:
			return cap
	return {}
