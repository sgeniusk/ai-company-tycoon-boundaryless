# MonthSystem.gd
# Handles monthly advancement: costs, decay, recovery, and summary generation.
# Autoload singleton: MonthSystem
#
# Responsible for:
# - Advancing the month counter
# - Applying salary costs
# - Applying compute costs based on users
# - Applying hype decay
# - Applying trust recovery
# - Generating monthly summary
# - Checking game over / win conditions

extends Node


func advance_month() -> Dictionary:
	"""Advance one month and return a summary of what happened."""
	var summary = {
		"month": GameState.current_month,
		"costs": {},
		"changes": {},
		"warnings": [],
		"game_over": false,
		"game_won": false,
	}
	
	# Record pre-state
	var pre_state = GameState.get_all_resources()
	
	# 1. Apply costs
	_apply_monthly_costs(summary)
	
	# 2. Apply hype decay
	_apply_hype_decay(summary)
	
	# 3. Apply trust recovery
	_apply_trust_recovery(summary)
	
	# 4. Advance month counter
	GameState.current_month += 1
	summary["new_month"] = GameState.current_month
	
	# 5. Calculate changes
	var post_state = GameState.get_all_resources()
	for key in pre_state:
		summary["changes"][key] = post_state[key] - pre_state[key]
	
	# 6. Check game over
	_check_game_over(summary)
	
	# 7. Check win condition
	_check_win_condition(summary)
	
	# 8. Emit signals
	EventBus.month_advanced.emit(GameState.current_month)
	EventBus.monthly_summary_ready.emit(summary)
	EventBus.resources_updated.emit()
	
	# 9. Log
	EventBus.log_message.emit("Month %d completed." % summary["month"])
	
	return summary


func _apply_monthly_costs(summary: Dictionary) -> void:
	"""Apply all monthly costs: base cost + salaries + compute."""
	var balance = DataLoader.load_balance()
	
	# Base monthly cost
	var base_cost = float(balance.get("base_monthly_cash_cost", 500))
	
	# Salary cost
	var salary_per_talent = float(balance.get("salary_per_talent", 800))
	var salary_cost = GameState.talent * salary_per_talent
	
	# Compute cost based on users
	var compute_cost_per_1000 = float(balance.get("compute_cost_per_1000_users", 50))
	var compute_cost = (GameState.users / 1000.0) * compute_cost_per_1000
	
	# Automation discount
	var auto_reduction = GameState.automation * float(balance.get("automation_cost_reduction_per_point", 0.005))
	var discount_multiplier = maxf(0.0, 1.0 - auto_reduction)
	
	# Total cash cost
	var total_cash_cost = (base_cost + salary_cost) * discount_multiplier + compute_cost
	
	# Apply costs
	ResourceSystem.add_resource("cash", -total_cash_cost)
	
	# Record in summary
	summary["costs"] = {
		"base_cost": base_cost,
		"salary_cost": salary_cost,
		"compute_cost": compute_cost,
		"automation_discount": (1.0 - discount_multiplier) * 100.0,
		"total_cash_cost": total_cash_cost,
	}
	
	# Warnings
	if GameState.cash < 0:
		summary["warnings"].append("Cash is negative! Company is in debt.")
	if compute_cost > GameState.compute * 10:
		summary["warnings"].append("Compute pressure is very high!")


func _apply_hype_decay(summary: Dictionary) -> void:
	"""Apply monthly hype decay."""
	var decay = DataLoader.get_balance_value("monthly_hype_decay", 2.0)
	if GameState.hype > 0:
		ResourceSystem.add_resource("hype", -decay)


func _apply_trust_recovery(summary: Dictionary) -> void:
	"""Apply trust recovery if below threshold."""
	var threshold = DataLoader.get_balance_value("trust_recovery_threshold", 50.0)
	var recovery = DataLoader.get_balance_value("trust_recovery_amount", 1.0)
	if GameState.trust < threshold:
		ResourceSystem.add_resource("trust", recovery)


func _check_game_over(summary: Dictionary) -> void:
	"""Check if game over conditions are met."""
	var balance = DataLoader.load_balance()
	var cash_threshold = float(balance.get("game_over_cash_threshold", -10000))
	var trust_threshold = float(balance.get("game_over_trust_threshold", 10))
	
	if GameState.cash < cash_threshold and GameState.trust < trust_threshold:
		summary["game_over"] = true
		summary["game_over_reason"] = "Cash below %d and Trust below %d." % [int(cash_threshold), int(trust_threshold)]
		EventBus.game_over.emit(summary["game_over_reason"])


func _check_win_condition(summary: Dictionary) -> void:
	"""Check if any win condition is met."""
	var balance = DataLoader.load_balance()
	
	var users_target = float(balance.get("success_users_threshold", 100000))
	var cash_target = float(balance.get("success_cash_threshold", 100000))
	var auto_target = float(balance.get("success_automation_threshold", 60))
	var min_products = int(balance.get("success_min_products", 3))
	
	if GameState.users >= users_target:
		summary["game_won"] = true
		summary["win_condition"] = "Reached %d users!" % int(users_target)
		EventBus.game_won.emit(summary["win_condition"])
	elif GameState.cash >= cash_target:
		summary["game_won"] = true
		summary["win_condition"] = "Accumulated $%d!" % int(cash_target)
		EventBus.game_won.emit(summary["win_condition"])
	elif GameState.automation >= auto_target and GameState.active_products.size() >= min_products:
		summary["game_won"] = true
		summary["win_condition"] = "Automation %d+ with %d+ products!" % [int(auto_target), min_products]
		EventBus.game_won.emit(summary["win_condition"])
