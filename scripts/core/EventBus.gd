# EventBus.gd
# Global signal bus for decoupled communication between systems.
# Autoload singleton: EventBus
#
# All systems emit and connect to signals here.
# UI listens to signals to update display.
# No system should directly reference another system.

extends Node


# === Resource Signals ===
signal resource_changed(resource_id: String, old_value: float, new_value: float)
signal resources_updated()

# === Month Signals ===
signal month_advanced(new_month: int)
signal month_costs_applied(costs: Dictionary)
signal monthly_summary_ready(summary: Dictionary)

# === Game State Signals ===
signal game_started()
signal game_over(reason: String)
signal game_won(condition: String)
signal company_stage_changed(old_stage: String, new_stage: String)

# === Product Signals (for future milestones) ===
signal product_launched(product_id: String)
signal product_removed(product_id: String)

# === Capability Signals (for future milestones) ===
signal capability_upgraded(capability_id: String, new_level: int)

# === Domain Signals (for future milestones) ===
signal domain_unlocked(domain_id: String)

# === Event Signals (for future milestones) ===
signal event_triggered(event_id: String)
signal event_resolved(event_id: String, choice_id: String)

# === Upgrade Signals (for future milestones) ===
signal upgrade_purchased(upgrade_id: String)

# === UI Signals ===
signal notification_requested(message: String, type: String)
signal log_message(message: String)

# === Debug Signals ===
signal validation_complete(results: Dictionary)
