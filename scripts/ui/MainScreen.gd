# MainScreen.gd
# Main screen UI controller — integrated with all game systems.
# Manages tabs, panels, modals, and game flow.

extends Control


# === Node References ===
@onready var month_label: Label = %MonthLabel
@onready var stage_label: Label = %StageLabel
@onready var title_label: Label = %TitleLabel
@onready var next_month_button: Button = %NextMonthButton
@onready var save_button: Button = %SaveButton
@onready var load_button: Button = %LoadButton
@onready var new_game_button: Button = %NewGameButton
@onready var event_log: RichTextLabel = %EventLog
@onready var resource_panel: VBoxContainer = %ResourcePanel
@onready var left_tab_container: TabContainer = %LeftTabContainer
@onready var summary_panel: VBoxContainer = %SummaryPanel
@onready var event_modal: PanelContainer = %EventModal
@onready var event_modal_content: VBoxContainer = %EventModalContent

# Tab content containers
@onready var products_tab: VBoxContainer = %ProductsTab
@onready var capabilities_tab: VBoxContainer = %CapabilitiesTab
@onready var upgrades_tab: VBoxContainer = %UpgradesTab


func _ready() -> void:
	_connect_signals()
	_update_header()
	_update_products_tab()
	_update_capabilities_tab()
	_update_upgrades_tab()
	_hide_event_modal()
	
	_log("Welcome to AI Company Tycoon: Boundaryless!")
	_log("You are starting a tiny AI startup. Grow it into a boundaryless company.")
	_log("---")
	_log("Tip: Launch a product to start earning revenue!")


func _connect_signals() -> void:
	next_month_button.pressed.connect(_on_next_month_pressed)
	save_button.pressed.connect(_on_save_pressed)
	load_button.pressed.connect(_on_load_pressed)
	new_game_button.pressed.connect(_on_new_game_pressed)
	EventBus.month_advanced.connect(_on_month_advanced)
	EventBus.monthly_summary_ready.connect(_on_monthly_summary)
	EventBus.game_over.connect(_on_game_over)
	EventBus.game_won.connect(_on_game_won)
	EventBus.log_message.connect(_log)
	EventBus.resources_updated.connect(_on_resources_updated)
	EventBus.company_stage_changed.connect(_on_stage_changed)
	EventBus.product_launched.connect(_on_product_launched)
	EventBus.domain_unlocked.connect(_on_domain_unlocked)


# === Header ===

func _update_header() -> void:
	title_label.text = "AI Company Tycoon: Boundaryless"
	month_label.text = "Month %d" % GameState.current_month
	stage_label.text = GameState.company_stage


# === Next Month ===

func _on_next_month_pressed() -> void:
	# Check for pending event
	if EventSystem.has_pending_event():
		_log("Resolve the current event first!")
		return
	
	var summary = MonthSystem.advance_month()
	_update_header()
	_update_summary(summary)
	_refresh_all_tabs()
	
	# Try to trigger an event (60% chance per month)
	if randf() < 0.6:
		var event = EventSystem.try_trigger_event()
		if not event.is_empty():
			_show_event_modal(event)


# === Products Tab ===

func _update_products_tab() -> void:
	_clear_children(products_tab)
	
	# Active products
	var active = ProductSystem.get_active_products()
	if not active.is_empty():
		_add_section_header(products_tab, "Active Products (%d)" % active.size())
		for product in active:
			_add_active_product_card(products_tab, product)
	
	# Available products
	var available = ProductSystem.get_available_products()
	if not available.is_empty():
		_add_section_header(products_tab, "Available to Launch")
		for product in available:
			_add_launchable_product_card(products_tab, product)
	
	# Locked products
	var locked = ProductSystem.get_locked_products()
	if not locked.is_empty():
		_add_section_header(products_tab, "Locked Products")
		for product in locked:
			_add_locked_product_card(products_tab, product)


func _add_active_product_card(parent: VBoxContainer, product: Dictionary) -> void:
	var card = PanelContainer.new()
	var vbox = VBoxContainer.new()
	var label = Label.new()
	label.text = "✅ %s" % product.get("name", "Unknown")
	var info = Label.new()
	info.text = "  Revenue: $%d/mo | Users: +%d/mo" % [int(product.get("base_revenue", 0)), int(product.get("base_users_per_month", 0))]
	info.add_theme_font_size_override("font_size", 12)
	vbox.add_child(label)
	vbox.add_child(info)
	card.add_child(vbox)
	parent.add_child(card)


func _add_launchable_product_card(parent: VBoxContainer, product: Dictionary) -> void:
	var card = PanelContainer.new()
	var vbox = VBoxContainer.new()
	var hbox = HBoxContainer.new()
	var label = Label.new()
	label.text = "%s" % product.get("name", "Unknown")
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var btn = Button.new()
	btn.text = "🚀 Launch"
	btn.pressed.connect(_on_launch_product.bind(product["id"]))
	hbox.add_child(label)
	hbox.add_child(btn)
	var info = Label.new()
	var costs = product.get("launch_cost", {})
	info.text = "  Cost: $%d, %d Compute, %d Data | Rev: $%d/mo" % [
		int(costs.get("cash", 0)),
		int(costs.get("compute", 0)),
		int(costs.get("data", 0)),
		int(product.get("base_revenue", 0))
	]
	info.add_theme_font_size_override("font_size", 11)
	var desc = Label.new()
	desc.text = "  %s" % product.get("description", "")
	desc.add_theme_font_size_override("font_size", 11)
	desc.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	vbox.add_child(hbox)
	vbox.add_child(info)
	vbox.add_child(desc)
	card.add_child(vbox)
	parent.add_child(card)


func _add_locked_product_card(parent: VBoxContainer, product: Dictionary) -> void:
	var card = PanelContainer.new()
	var vbox = VBoxContainer.new()
	var label = Label.new()
	label.text = "🔒 %s" % product.get("name", "Unknown")
	var reason = Label.new()
	reason.text = "  %s" % ProductSystem.get_lock_reason(product["id"])
	reason.add_theme_font_size_override("font_size", 11)
	reason.add_theme_color_override("font_color", Color(0.7, 0.5, 0.5))
	vbox.add_child(label)
	vbox.add_child(reason)
	card.add_child(vbox)
	parent.add_child(card)


func _on_launch_product(product_id: String) -> void:
	ProductSystem.launch_product(product_id)
	_refresh_all_tabs()


# === Capabilities Tab ===

func _update_capabilities_tab() -> void:
	_clear_children(capabilities_tab)
	
	# Domains section
	_add_section_header(capabilities_tab, "Domains")
	for domain in DomainSystem.get_all_domains():
		var unlocked = DomainSystem.is_unlocked(domain["id"])
		var label = Label.new()
		if unlocked:
			label.text = "%s %s ✓" % [domain.get("icon", ""), domain.get("name", "")]
			label.add_theme_color_override("font_color", Color(0.5, 1.0, 0.5))
		else:
			label.text = "%s %s — %s" % [domain.get("icon", ""), domain.get("name", ""), DomainSystem.get_lock_reason(domain["id"])]
			label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		label.add_theme_font_size_override("font_size", 13)
		capabilities_tab.add_child(label)
	
	# Capabilities section
	_add_section_header(capabilities_tab, "AI Capabilities")
	for cap in CapabilitySystem.get_all_capabilities():
		var level = CapabilitySystem.get_capability_level(cap["id"])
		var max_level = int(cap.get("max_level", 1))
		var hbox = HBoxContainer.new()
		var label = Label.new()
		label.text = "%s %s  Lv.%d/%d" % [cap.get("icon", ""), cap.get("name", ""), level, max_level]
		label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hbox.add_child(label)
		
		if level < max_level:
			var btn = Button.new()
			if CapabilitySystem.can_upgrade(cap["id"]):
				var cost = CapabilitySystem.get_upgrade_cost(cap["id"])
				btn.text = "⬆️ $%d" % int(cost.get("cash", 0))
				btn.pressed.connect(_on_upgrade_capability.bind(cap["id"]))
			else:
				var cost = CapabilitySystem.get_upgrade_cost(cap["id"])
				btn.text = "Need $%d" % int(cost.get("cash", 0))
				btn.disabled = true
			hbox.add_child(btn)
		else:
			var max_label = Label.new()
			max_label.text = "MAX"
			max_label.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2))
			hbox.add_child(max_label)
		
		capabilities_tab.add_child(hbox)


func _on_upgrade_capability(cap_id: String) -> void:
	CapabilitySystem.upgrade_capability(cap_id)
	DomainSystem.check_all_domain_unlocks()
	_refresh_all_tabs()


# === Upgrades Tab ===

func _update_upgrades_tab() -> void:
	_clear_children(upgrades_tab)
	
	# General upgrades
	_add_section_header(upgrades_tab, "Upgrades")
	var available = UpgradeSystem.get_available_upgrades()
	if available.is_empty():
		var label = Label.new()
		label.text = "No upgrades available yet. Advance months to unlock more."
		label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		label.add_theme_font_size_override("font_size", 12)
		upgrades_tab.add_child(label)
	else:
		for upgrade in available:
			_add_upgrade_card(upgrades_tab, upgrade, false)
	
	# Automation upgrades
	_add_section_header(upgrades_tab, "Automation")
	var auto_available = AutomationSystem.get_available_automation()
	if auto_available.is_empty():
		var label = Label.new()
		label.text = "No automation upgrades available yet."
		label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		label.add_theme_font_size_override("font_size", 12)
		upgrades_tab.add_child(label)
	else:
		for auto_up in auto_available:
			_add_upgrade_card(upgrades_tab, auto_up, true)


func _add_upgrade_card(parent: VBoxContainer, upgrade: Dictionary, is_automation: bool) -> void:
	var card = PanelContainer.new()
	var vbox = VBoxContainer.new()
	var hbox = HBoxContainer.new()
	var label = Label.new()
	label.text = upgrade.get("name", "Unknown")
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var btn = Button.new()
	var cost = upgrade.get("cost", {})
	btn.text = "🛒 $%d" % int(cost.get("cash", 0))
	if is_automation:
		btn.pressed.connect(_on_buy_automation.bind(upgrade["id"]))
	else:
		btn.pressed.connect(_on_buy_upgrade.bind(upgrade["id"]))
	hbox.add_child(label)
	hbox.add_child(btn)
	var desc = Label.new()
	desc.text = "  %s" % upgrade.get("description", "")
	desc.add_theme_font_size_override("font_size", 11)
	desc.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	vbox.add_child(hbox)
	vbox.add_child(desc)
	if is_automation:
		var benefit = Label.new()
		benefit.text = "  Monthly: %s" % upgrade.get("monthly_benefit", "")
		benefit.add_theme_font_size_override("font_size", 11)
		benefit.add_theme_color_override("font_color", Color(0.5, 0.9, 0.5))
		vbox.add_child(benefit)
	card.add_child(vbox)
	parent.add_child(card)


func _on_buy_upgrade(upgrade_id: String) -> void:
	UpgradeSystem.purchase_upgrade(upgrade_id)
	_refresh_all_tabs()


func _on_buy_automation(auto_id: String) -> void:
	AutomationSystem.purchase_automation(auto_id)
	_refresh_all_tabs()


# === Event Modal ===

func _show_event_modal(event: Dictionary) -> void:
	event_modal.visible = true
	_clear_children(event_modal_content)
	
	var title = Label.new()
	title.text = "⚡ %s" % event.get("name", "Event")
	title.add_theme_font_size_override("font_size", 18)
	event_modal_content.add_child(title)
	
	var desc = Label.new()
	desc.text = event.get("description", "")
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	event_modal_content.add_child(desc)
	
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 12)
	event_modal_content.add_child(spacer)
	
	var choices = event.get("choices", [])
	for choice in choices:
		var btn = Button.new()
		btn.text = "%s\n  (%s)" % [choice.get("text", ""), choice.get("description", "")]
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.pressed.connect(_on_event_choice.bind(choice["id"]))
		event_modal_content.add_child(btn)


func _on_event_choice(choice_id: String) -> void:
	EventSystem.resolve_event(choice_id)
	_hide_event_modal()
	_refresh_all_tabs()


func _hide_event_modal() -> void:
	event_modal.visible = false


# === Summary Panel ===

func _update_summary(summary: Dictionary) -> void:
	_clear_children(summary_panel)
	
	_add_summary_line("Month: %d" % GameState.current_month)
	_add_summary_line("Stage: %s" % GameState.company_stage)
	_add_summary_line("Active Products: %d" % ProductSystem.active_products.size())
	_add_summary_line("---")
	
	var costs = summary.get("costs", {})
	_add_summary_line("Monthly Costs:")
	_add_summary_line("  Salary: -$%d" % int(costs.get("salary_cost", 0)))
	_add_summary_line("  Compute: -$%d" % int(costs.get("compute_cost", 0)))
	_add_summary_line("  Base: -$%d" % int(costs.get("base_cost", 0)))
	_add_summary_line("  Total: -$%d" % int(costs.get("total_cash_cost", 0)))
	
	if costs.get("automation_discount", 0) > 0:
		_add_summary_line("  Auto discount: %.1f%%" % costs["automation_discount"])


func _add_summary_line(text: String) -> void:
	var label = Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", 12)
	summary_panel.add_child(label)


# === Signal Handlers ===

func _on_month_advanced(new_month: int) -> void:
	month_label.text = "Month %d" % new_month


func _on_monthly_summary(summary: Dictionary) -> void:
	_log("--- Month %d Summary ---" % summary["month"])
	var costs = summary.get("costs", {})
	if not costs.is_empty():
		_log("  Costs: -$%d" % int(costs.get("total_cash_cost", 0)))
	for warning in summary.get("warnings", []):
		_log("  ⚠️ %s" % warning)


func _on_game_over(reason: String) -> void:
	_log("💀 GAME OVER: %s" % reason)
	next_month_button.disabled = true
	next_month_button.text = "GAME OVER"


func _on_game_won(condition: String) -> void:
	_log("🎉 VICTORY: %s" % condition)
	next_month_button.disabled = true
	next_month_button.text = "YOU WIN!"


func _on_resources_updated() -> void:
	pass  # ResourcePanel handles its own updates via EventBus


func _on_stage_changed(_old: String, new_stage: String) -> void:
	stage_label.text = new_stage


func _on_product_launched(_product_id: String) -> void:
	_refresh_all_tabs()


func _on_domain_unlocked(_domain_id: String) -> void:
	_refresh_all_tabs()


# === Save/Load ===

func _on_save_pressed() -> void:
	SaveManager.save_game()


func _on_load_pressed() -> void:
	if SaveManager.load_game():
		_update_header()
		_refresh_all_tabs()


func _on_new_game_pressed() -> void:
	SaveManager.new_game()
	_update_header()
	_refresh_all_tabs()
	next_month_button.disabled = false
	next_month_button.text = "Next Month ▶"
	_clear_children(summary_panel)
	event_log.clear()
	_log("New game started! Good luck!")


# === Utility ===

func _refresh_all_tabs() -> void:
	_update_products_tab()
	_update_capabilities_tab()
	_update_upgrades_tab()


func _clear_children(node: Node) -> void:
	for child in node.get_children():
		child.queue_free()


func _add_section_header(parent: VBoxContainer, text: String) -> void:
	var label = Label.new()
	label.text = "── %s ──" % text
	label.add_theme_font_size_override("font_size", 14)
	label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0))
	parent.add_child(label)


func _log(message: String) -> void:
	if event_log:
		event_log.append_text(message + "\n")
