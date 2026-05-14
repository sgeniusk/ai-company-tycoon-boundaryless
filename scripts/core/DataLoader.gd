# DataLoader.gd
# Responsible for loading and parsing JSON data files.
# Autoload singleton: DataLoader
#
# Features:
# - Load any JSON file by path
# - Validate required fields
# - Report missing or invalid data with clear messages
# - Return safe defaults when non-critical data is missing

extends Node


## Cache for loaded data files
var _cache: Dictionary = {}


func load_json(path: String) -> Variant:
	"""Load a JSON file and return parsed data. Returns null on failure."""
	# Check cache first
	if _cache.has(path):
		return _cache[path]
	
	# Check file exists
	if not FileAccess.file_exists(path):
		push_error("[DataLoader] File not found: %s" % path)
		return null
	
	# Open and read file
	var file = FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("[DataLoader] Cannot open file: %s (error: %s)" % [path, FileAccess.get_open_error()])
		return null
	
	var content = file.get_as_text()
	file.close()
	
	# Parse JSON
	var json = JSON.new()
	var error = json.parse(content)
	if error != OK:
		push_error("[DataLoader] JSON parse error in %s: %s (line %d)" % [path, json.get_error_message(), json.get_error_line()])
		return null
	
	var data = json.get_data()
	_cache[path] = data
	return data


func load_resources() -> Dictionary:
	"""Load resources.json and return the resources dictionary."""
	var data = load_json("res://data/resources.json")
	if data == null or not data.has("resources"):
		push_warning("[DataLoader] resources.json missing or invalid. Using empty dict.")
		return {}
	return data["resources"]


func load_balance() -> Dictionary:
	"""Load balance.json and return the balance dictionary."""
	var data = load_json("res://data/balance.json")
	if data == null or not data.has("balance"):
		push_warning("[DataLoader] balance.json missing or invalid. Using empty dict.")
		return {}
	return data["balance"]


func get_balance_value(key: String, default_value: float = 0.0) -> float:
	"""Get a specific balance value with a safe default."""
	var balance = load_balance()
	if balance.has(key):
		return float(balance[key])
	push_warning("[DataLoader] Balance key '%s' not found. Using default: %s" % [key, str(default_value)])
	return default_value


func validate_keys(data: Dictionary, required_keys: Array, context: String) -> Array[String]:
	"""Check that all required keys exist in a dictionary. Returns list of missing keys."""
	var missing: Array[String] = []
	for key in required_keys:
		if not data.has(key):
			missing.append(key)
			push_warning("[DataLoader] Missing key '%s' in %s" % [key, context])
	return missing


func clear_cache() -> void:
	"""Clear the data cache. Useful for reloading after changes."""
	_cache.clear()
