# ResourceSystem.gd
# Handles all resource mutations: adding, spending, clamping, and effect application.
# Autoload singleton: ResourceSystem
#
# All resource changes MUST go through this system.
# Emits signals via EventBus for UI updates.

extends Node


## Resource limits loaded from config
var _limits: Dictionary = {}


func _ready() -> void:
	_load_limits()


func _load_limits() -> void:
	"""Load min/max limits from resource config."""
	var config = GameState.get_resource_config()
	for resource_id in config:
		var res_data = config[resource_id]
		_limits[resource_id] = {
			"min": float(res_data.get("min_value", 0)),
			"max": float(res_data.get("max_value", 999999999)),
		}


# === Core Operations ===

func add_resource(resource_id: String, amount: float) -> void:
	"""Add amount to a resource (can be negative for spending)."""
	var old_value = GameState.get_resource(resource_id)
	var new_value = old_value + amount
	new_value = _clamp_resource(resource_id, new_value)
	_set_resource(resource_id, new_value)
	EventBus.resource_changed.emit(resource_id, old_value, new_value)


func spend_resource(resource_id: String, amount: float) -> bool:
	"""Spend a resource. Returns true if successful (enough available)."""
	var current = GameState.get_resource(resource_id)
	# Cash can go negative (debt), other resources cannot
	if resource_id != "cash" and current < amount:
		return false
	add_resource(resource_id, -amount)
	return true


func can_afford(costs: Dictionary) -> bool:
	"""Check if all costs in a dictionary can be paid."""
	for resource_id in costs:
		var current = GameState.get_resource(resource_id)
		if resource_id != "cash" and current < costs[resource_id]:
			return false
	return true


func spend_multiple(costs: Dictionary) -> bool:
	"""Spend multiple resources at once. All-or-nothing."""
	if not can_afford(costs):
		return false
	for resource_id in costs:
		add_resource(resource_id, -costs[resource_id])
	return true


func apply_effects(effects: Dictionary) -> void:
	"""Apply a dictionary of resource effects (positive or negative)."""
	for resource_id in effects:
		add_resource(resource_id, float(effects[resource_id]))
	EventBus.resources_updated.emit()


# === Clamping ===

func _clamp_resource(resource_id: String, value: float) -> float:
	"""Clamp a resource value to its configured min/max."""
	var min_val: float = 0.0
	var max_val: float = 999999999.0
	
	if _limits.has(resource_id):
		min_val = _limits[resource_id]["min"]
		max_val = _limits[resource_id]["max"]
	else:
		# Default clamps for known bounded resources
		match resource_id:
			"trust": 
				min_val = 0.0
				max_val = 100.0
			"hype":
				min_val = 0.0
				max_val = 100.0
			"automation":
				min_val = 0.0
				max_val = 100.0
			"users":
				min_val = 0.0
			"compute":
				min_val = 0.0
	
	return clampf(value, min_val, max_val)


# === Internal Setters ===

func _set_resource(resource_id: String, value: float) -> void:
	"""Set a resource value on GameState."""
	match resource_id:
		"cash": GameState.cash = value
		"users": GameState.users = value
		"compute": GameState.compute = value
		"data": GameState.data = value
		"talent": GameState.talent = value
		"trust": GameState.trust = value
		"hype": GameState.hype = value
		"automation": GameState.automation = value
		_:
			push_warning("[ResourceSystem] Cannot set unknown resource: %s" % resource_id)
