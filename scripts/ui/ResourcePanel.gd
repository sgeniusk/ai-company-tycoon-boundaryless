# ResourcePanel.gd
# UI script for displaying all resource values.
# Attached to the ResourcePanel node in the main scene.
#
# Listens to EventBus signals to update display.
# Does NOT contain any game logic.

extends VBoxContainer


# Resource label references (populated in _ready)
var _resource_labels: Dictionary = {}

# Display order
const RESOURCE_ORDER = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"]


func _ready() -> void:
	_build_resource_display()
	_connect_signals()
	_update_all()


func _build_resource_display() -> void:
	"""Create label nodes for each resource."""
	for resource_id in RESOURCE_ORDER:
		var hbox = HBoxContainer.new()
		hbox.name = "Row_" + resource_id
		
		# Icon + Name label
		var name_label = Label.new()
		name_label.name = "Name_" + resource_id
		name_label.custom_minimum_size = Vector2(120, 0)
		name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
		hbox.add_child(name_label)
		
		# Value label
		var value_label = Label.new()
		value_label.name = "Value_" + resource_id
		value_label.custom_minimum_size = Vector2(100, 0)
		value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		hbox.add_child(value_label)
		
		add_child(hbox)
		_resource_labels[resource_id] = {
			"name": name_label,
			"value": value_label,
		}


func _connect_signals() -> void:
	"""Connect to EventBus signals for updates."""
	EventBus.resources_updated.connect(_update_all)
	EventBus.resource_changed.connect(_on_resource_changed)
	EventBus.game_started.connect(_update_all)


func _update_all() -> void:
	"""Update all resource displays."""
	var config = GameState.get_resource_config()
	for resource_id in RESOURCE_ORDER:
		if not _resource_labels.has(resource_id):
			continue
		
		var labels = _resource_labels[resource_id]
		var value = GameState.get_resource(resource_id)
		
		# Get display info from config
		var icon = ""
		var display_name = resource_id.capitalize()
		if config.has(resource_id):
			icon = config[resource_id].get("icon", "")
			display_name = config[resource_id].get("name", display_name)
		
		labels["name"].text = "%s %s" % [icon, display_name]
		labels["value"].text = _format_value(resource_id, value)


func _on_resource_changed(resource_id: String, _old_value: float, _new_value: float) -> void:
	"""Handle individual resource change."""
	if _resource_labels.has(resource_id):
		var value = GameState.get_resource(resource_id)
		_resource_labels[resource_id]["value"].text = _format_value(resource_id, value)


func _format_value(resource_id: String, value: float) -> String:
	"""Format a resource value for display."""
	match resource_id:
		"cash":
			if value >= 1000000:
				return "$%.1fM" % (value / 1000000.0)
			elif value >= 1000:
				return "$%.1fK" % (value / 1000.0)
			else:
				return "$%d" % int(value)
		"users":
			if value >= 1000000:
				return "%.1fM" % (value / 1000000.0)
			elif value >= 1000:
				return "%.1fK" % (value / 1000.0)
			else:
				return "%d" % int(value)
		"trust", "hype", "automation":
			return "%d / 100" % int(value)
		"talent":
			return "%d" % int(value)
		_:
			return "%d" % int(value)
