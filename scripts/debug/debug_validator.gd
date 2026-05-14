# debug_validator.gd
# Validates all game data files at startup.
# class_name: DebugValidator

extends Node
class_name DebugValidator


var errors: Array[String] = []
var warnings: Array[String] = []


const REQUIRED_FILES: Array[String] = [
	"res://data/resources.json",
	"res://data/balance.json",
	"res://data/products.json",
	"res://data/capabilities.json",
	"res://data/domains.json",
	"res://data/events.json",
	"res://data/upgrades.json",
	"res://data/automation_upgrades.json",
	"res://data/company_stages.json",
	"res://data/ui_text.json",
]


func run_all_checks() -> Dictionary:
	errors.clear()
	warnings.clear()
	
	_check_files_exist()
	_check_json_parse()
	_check_resources()
	_check_balance()
	_check_products()
	_check_capabilities()
	_check_domains()
	_check_events()
	
	var passed = errors.is_empty()
	return {
		"passed": passed,
		"errors": errors.duplicate(),
		"warnings": warnings.duplicate(),
		"error_count": errors.size(),
		"warning_count": warnings.size(),
	}


func _check_files_exist() -> void:
	for path in REQUIRED_FILES:
		if not FileAccess.file_exists(path):
			errors.append("Missing file: %s" % path)


func _check_json_parse() -> void:
	for path in REQUIRED_FILES:
		if not FileAccess.file_exists(path):
			continue
		var file = FileAccess.open(path, FileAccess.READ)
		if file == null:
			errors.append("Cannot open: %s" % path)
			continue
		var content = file.get_as_text()
		file.close()
		var json = JSON.new()
		if json.parse(content) != OK:
			errors.append("JSON parse error in %s: %s" % [path, json.get_error_message()])


func _check_resources() -> void:
	var data = DataLoader.load_json("res://data/resources.json")
	if data == null:
		return
	var resources = data.get("resources", {})
	var required_ids = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"]
	for rid in required_ids:
		if not resources.has(rid):
			errors.append("resources.json missing resource: %s" % rid)
		else:
			var r = resources[rid]
			if not r.has("initial_value"):
				errors.append("Resource '%s' missing initial_value" % rid)
			if not r.has("name"):
				warnings.append("Resource '%s' missing name" % rid)


func _check_balance() -> void:
	var data = DataLoader.load_json("res://data/balance.json")
	if data == null:
		return
	var balance = data.get("balance", {})
	var required_keys = [
		"base_monthly_cash_cost", "salary_per_talent", "monthly_hype_decay",
		"game_over_cash_threshold", "success_users_threshold"
	]
	for key in required_keys:
		if not balance.has(key):
			errors.append("balance.json missing key: %s" % key)


func _check_products() -> void:
	var data = DataLoader.load_json("res://data/products.json")
	if data == null:
		return
	var products = data.get("products", [])
	if products.is_empty():
		errors.append("products.json has no products")
		return
	for p in products:
		if not p.has("id"):
			errors.append("Product missing 'id' field")
		if not p.has("launch_cost"):
			errors.append("Product '%s' missing launch_cost" % p.get("id", "?"))
		if not p.has("base_revenue"):
			warnings.append("Product '%s' missing base_revenue" % p.get("id", "?"))


func _check_capabilities() -> void:
	var data = DataLoader.load_json("res://data/capabilities.json")
	if data == null:
		return
	var caps = data.get("capabilities", [])
	if caps.is_empty():
		errors.append("capabilities.json has no capabilities")
		return
	for c in caps:
		if not c.has("id"):
			errors.append("Capability missing 'id' field")
		if not c.has("upgrade_costs"):
			errors.append("Capability '%s' missing upgrade_costs" % c.get("id", "?"))


func _check_domains() -> void:
	var data = DataLoader.load_json("res://data/domains.json")
	if data == null:
		return
	var domains = data.get("domains", [])
	if domains.is_empty():
		errors.append("domains.json has no domains")
		return
	var has_default = false
	for d in domains:
		if not d.has("id"):
			errors.append("Domain missing 'id' field")
		if d.get("unlocked_by_default", false):
			has_default = true
	if not has_default:
		warnings.append("No domain is unlocked by default")


func _check_events() -> void:
	var data = DataLoader.load_json("res://data/events.json")
	if data == null:
		return
	var events = data.get("events", [])
	if events.is_empty():
		warnings.append("events.json has no events")
		return
	for e in events:
		if not e.has("id"):
			errors.append("Event missing 'id' field")
		if not e.has("choices") or e["choices"].is_empty():
			errors.append("Event '%s' has no choices" % e.get("id", "?"))


func print_report() -> void:
	print("=== DebugValidator Report ===")
	if errors.is_empty() and warnings.is_empty():
		print("  All checks PASSED.")
	else:
		for e in errors:
			print("  [ERROR] %s" % e)
		for w in warnings:
			print("  [WARN] %s" % w)
	print("  Errors: %d | Warnings: %d" % [errors.size(), warnings.size()])
	print("=============================")
