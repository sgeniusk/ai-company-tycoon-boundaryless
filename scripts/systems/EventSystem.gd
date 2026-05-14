# EventSystem.gd
# Manages monthly event triggering, condition checking, and resolution.
# Autoload singleton: EventSystem

extends Node

## All event definitions
var all_events: Array[Dictionary] = []

## Events that have been triggered this game (for tracking)
var triggered_events: Array[String] = []

## Current pending event (waiting for player choice)
var current_event: Dictionary = {}


func _ready() -> void:
	_load_events()


func _load_events() -> void:
	"""Load event definitions from JSON."""
	var data = DataLoader.load_json("res://data/events.json")
	if data == null or not data.has("events"):
		push_error("[EventSystem] Failed to load events.json")
		return
	all_events.clear()
	for e in data["events"]:
		all_events.append(e)


func try_trigger_event() -> Dictionary:
	"""Try to trigger a random event based on conditions. Returns event or empty dict."""
	var eligible: Array[Dictionary] = []
	
	for event in all_events:
		if _check_conditions(event):
			eligible.append(event)
	
	if eligible.is_empty():
		return {}
	
	# Weighted random selection
	var total_weight: float = 0.0
	for event in eligible:
		total_weight += float(event.get("weight", 5))
	
	var roll = randf() * total_weight
	var cumulative: float = 0.0
	for event in eligible:
		cumulative += float(event.get("weight", 5))
		if roll <= cumulative:
			current_event = event
			triggered_events.append(event["id"])
			EventBus.event_triggered.emit(event["id"])
			return event
	
	# Fallback
	current_event = eligible[0]
	triggered_events.append(eligible[0]["id"])
	EventBus.event_triggered.emit(eligible[0]["id"])
	return eligible[0]


func resolve_event(choice_id: String) -> Dictionary:
	"""Resolve the current event with the given choice. Returns effects applied."""
	if current_event.is_empty():
		return {}
	
	var choices = current_event.get("choices", [])
	var chosen: Dictionary = {}
	for choice in choices:
		if choice["id"] == choice_id:
			chosen = choice
			break
	
	if chosen.is_empty():
		push_warning("[EventSystem] Choice '%s' not found in event '%s'" % [choice_id, current_event.get("id", "")])
		return {}
	
	# Apply effects
	var effects = chosen.get("effects", {})
	for resource_id in effects:
		ResourceSystem.add_resource(resource_id, float(effects[resource_id]))
	
	EventBus.event_resolved.emit(current_event["id"], choice_id)
	EventBus.resources_updated.emit()
	EventBus.log_message.emit("Event resolved: %s → %s" % [current_event.get("name", ""), chosen.get("text", "")])
	
	var result = {
		"event_id": current_event["id"],
		"event_name": current_event.get("name", ""),
		"choice_id": choice_id,
		"choice_text": chosen.get("text", ""),
		"effects": effects,
	}
	
	current_event = {}
	return result


func get_current_event() -> Dictionary:
	return current_event


func has_pending_event() -> bool:
	return not current_event.is_empty()


func get_events_triggered_count() -> int:
	return triggered_events.size()


func _check_conditions(event: Dictionary) -> bool:
	"""Check if an event's conditions are met."""
	var conditions = event.get("conditions", {})
	
	if conditions.has("min_month"):
		if GameState.current_month < int(conditions["min_month"]):
			return false
	
	if conditions.has("min_products"):
		if ProductSystem.active_products.size() < int(conditions["min_products"]):
			return false
	
	if conditions.has("min_users"):
		if GameState.users < float(conditions["min_users"]):
			return false
	
	if conditions.has("min_trust"):
		if GameState.trust < float(conditions["min_trust"]):
			return false
	
	if conditions.has("min_hype"):
		if GameState.hype < float(conditions["min_hype"]):
			return false
	
	if conditions.has("min_talent"):
		if GameState.talent < float(conditions["min_talent"]):
			return false
	
	if conditions.has("min_data"):
		if GameState.data < float(conditions["min_data"]):
			return false
	
	if conditions.has("min_capabilities"):
		var cap_count = GameState.unlocked_capabilities.size()
		if cap_count < int(conditions["min_capabilities"]):
			return false
	
	return true
