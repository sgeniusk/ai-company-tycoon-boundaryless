# SaveManager.gd
# Handles save/load game state. Only saves runtime state, not static data.
# Autoload singleton: SaveManager

extends Node

const SAVE_PATH = "user://savegame.json"
const SAVE_VERSION = 1


func save_game() -> bool:
	"""Save current game state to file. Returns true if successful."""
	var save_data = {
		"version": SAVE_VERSION,
		"timestamp": Time.get_datetime_string_from_system(),
		"state": {
			"cash": GameState.cash,
			"users": GameState.users,
			"compute": GameState.compute,
			"data": GameState.data,
			"talent": GameState.talent,
			"trust": GameState.trust,
			"hype": GameState.hype,
			"automation": GameState.automation,
			"current_month": GameState.current_month,
			"company_stage": GameState.company_stage,
			"unlocked_domains": GameState.unlocked_domains,
			"unlocked_capabilities": GameState.unlocked_capabilities,
			"active_products": GameState.active_products,
			"purchased_upgrades": GameState.purchased_upgrades,
			"flags": GameState.flags,
		},
		"systems": {
			"product_active": ProductSystem.active_products,
			"automation_purchased": AutomationSystem.purchased_automation,
			"events_triggered": EventSystem.triggered_events,
		}
	}
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("[SaveManager] Cannot open save file for writing: %s" % SAVE_PATH)
		EventBus.log_message.emit("Save failed! Cannot write file.")
		return false
	
	var json_string = JSON.stringify(save_data, "  ")
	file.store_string(json_string)
	file.close()
	
	EventBus.log_message.emit("Game saved successfully.")
	return true


func load_game() -> bool:
	"""Load game state from file. Returns true if successful."""
	if not FileAccess.file_exists(SAVE_PATH):
		EventBus.log_message.emit("No save file found.")
		return false
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		push_error("[SaveManager] Cannot open save file for reading: %s" % SAVE_PATH)
		EventBus.log_message.emit("Load failed! Cannot read file.")
		return false
	
	var content = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var error = json.parse(content)
	if error != OK:
		push_error("[SaveManager] Save file corrupted: %s" % json.get_error_message())
		EventBus.log_message.emit("Load failed! Save file corrupted.")
		return false
	
	var save_data = json.get_data()
	
	# Version check
	var version = int(save_data.get("version", 0))
	if version != SAVE_VERSION:
		push_warning("[SaveManager] Save version mismatch: expected %d, got %d" % [SAVE_VERSION, version])
	
	# Restore state
	var state = save_data.get("state", {})
	GameState.cash = float(state.get("cash", 10000))
	GameState.users = float(state.get("users", 0))
	GameState.compute = float(state.get("compute", 100))
	GameState.data = float(state.get("data", 50))
	GameState.talent = float(state.get("talent", 3))
	GameState.trust = float(state.get("trust", 50))
	GameState.hype = float(state.get("hype", 10))
	GameState.automation = float(state.get("automation", 0))
	GameState.current_month = int(state.get("current_month", 1))
	GameState.company_stage = state.get("company_stage", "Garage Prototype")
	
	# Restore arrays
	GameState.unlocked_domains.clear()
	for d in state.get("unlocked_domains", ["personal_productivity"]):
		GameState.unlocked_domains.append(str(d))
	
	GameState.unlocked_capabilities = {}
	var caps = state.get("unlocked_capabilities", {"language": 1})
	for key in caps:
		GameState.unlocked_capabilities[key] = int(caps[key])
	
	GameState.active_products.clear()
	for p in state.get("active_products", []):
		GameState.active_products.append(str(p))
	
	GameState.purchased_upgrades.clear()
	for u in state.get("purchased_upgrades", []):
		GameState.purchased_upgrades.append(str(u))
	
	GameState.flags = state.get("flags", {})
	
	# Restore system state
	var systems = save_data.get("systems", {})
	
	ProductSystem.active_products.clear()
	for p in systems.get("product_active", []):
		ProductSystem.active_products.append(str(p))
	
	AutomationSystem.purchased_automation.clear()
	for a in systems.get("automation_purchased", []):
		AutomationSystem.purchased_automation.append(str(a))
	
	EventSystem.triggered_events.clear()
	for e in systems.get("events_triggered", []):
		EventSystem.triggered_events.append(str(e))
	
	# Emit signals to update UI
	EventBus.resources_updated.emit()
	EventBus.game_started.emit()
	EventBus.log_message.emit("Game loaded successfully. Month %d." % GameState.current_month)
	
	return true


func has_save() -> bool:
	"""Check if a save file exists."""
	return FileAccess.file_exists(SAVE_PATH)


func delete_save() -> void:
	"""Delete the save file."""
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)


func new_game() -> void:
	"""Start a new game by resetting all state."""
	delete_save()
	GameState.reset_game()
	ProductSystem.active_products.clear()
	AutomationSystem.purchased_automation.clear()
	EventSystem.triggered_events.clear()
	EventSystem.current_event = {}
	EventBus.log_message.emit("New game started!")
