# CompanyStageSystem.gd
# Checks and updates company stage based on progress.
# Autoload singleton: CompanyStageSystem

extends Node

var all_stages: Array[Dictionary] = []


func _ready() -> void:
	_load_stages()
	EventBus.month_advanced.connect(_on_month_advanced)


func _load_stages() -> void:
	"""Load company stage definitions from JSON."""
	var data = DataLoader.load_json("res://data/company_stages.json")
	if data == null or not data.has("company_stages"):
		push_error("[CompanyStageSystem] Failed to load company_stages.json")
		return
	all_stages.clear()
	for s in data["company_stages"]:
		all_stages.append(s)
	# Sort by order
	all_stages.sort_custom(func(a, b): return int(a.get("order", 0)) < int(b.get("order", 0)))


func _on_month_advanced(_new_month: int) -> void:
	"""Check if company should advance to next stage."""
	check_stage_advancement()


func check_stage_advancement() -> void:
	"""Check all stages and advance to the highest qualifying one."""
	var current_order = _get_current_stage_order()
	
	for stage in all_stages:
		var stage_order = int(stage.get("order", 0))
		if stage_order <= current_order:
			continue
		if _meets_requirements(stage):
			var old_stage = GameState.company_stage
			GameState.company_stage = stage.get("name", "Unknown")
			EventBus.company_stage_changed.emit(old_stage, GameState.company_stage)
			EventBus.log_message.emit("🎉 Company evolved: %s!" % GameState.company_stage)


func _get_current_stage_order() -> int:
	for stage in all_stages:
		if stage.get("name", "") == GameState.company_stage:
			return int(stage.get("order", 0))
	return 0


func _meets_requirements(stage: Dictionary) -> bool:
	var reqs = stage.get("requirements", {})
	if reqs.is_empty():
		return true
	
	if reqs.has("min_products"):
		if ProductSystem.active_products.size() < int(reqs["min_products"]):
			return false
	if reqs.has("min_users"):
		if GameState.users < float(reqs["min_users"]):
			return false
	if reqs.has("min_hype"):
		if GameState.hype < float(reqs["min_hype"]):
			return false
	if reqs.has("min_trust"):
		if GameState.trust < float(reqs["min_trust"]):
			return false
	if reqs.has("min_cash"):
		if GameState.cash < float(reqs["min_cash"]):
			return false
	if reqs.has("min_domains"):
		if GameState.unlocked_domains.size() < int(reqs["min_domains"]):
			return false
	if reqs.has("min_automation"):
		if GameState.automation < float(reqs["min_automation"]):
			return false
	
	return true
