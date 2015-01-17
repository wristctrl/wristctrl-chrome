#include "common.h"

#define LONG_CLICK_HOLD_MS 600

static Window* window;

static int current_app_num = 0;
extern char apps[8][64];

static ActionBarLayer* action_bar;

TextLayer* header_text;
TextLayer* main_text;
static TextLayer* footer_text;

static GBitmap* action_icon_play;
static GBitmap* action_icon_pause;
static GBitmap* action_icon_volume_up;
static GBitmap* action_icon_volume_down;
static GBitmap* action_icon_right_arrow;
static GBitmap* action_icon_left_arrow;

static bool is_playing = false;
static bool is_volume_control = false;

static void vibes_shorter_pulse(void) {
  static const uint32_t const segments[] = {100};
  VibePattern pat = {
    .durations = segments,
    .num_segments = ARRAY_LENGTH(segments),
  };
  vibes_enqueue_custom_pattern(pat);
}

static void update_select_icon(void) {
  action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, is_playing ? action_icon_pause : action_icon_play);
}

static void update_up_and_down_icons(void) {
  action_bar_layer_set_icon(action_bar, BUTTON_ID_UP,   is_volume_control ? action_icon_volume_up   : action_icon_left_arrow);
  action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, is_volume_control ? action_icon_volume_down : action_icon_right_arrow);
}

static void select_long_click_handler(ClickRecognizerRef recognizer, void *context) {
  is_volume_control = !is_volume_control;
  update_up_and_down_icons();
  vibes_shorter_pulse();
}

static void select_single_click_handler(ClickRecognizerRef recognizer, void *context) {
  is_playing = !is_playing;
  update_select_icon();
  send_command(apps[current_app_num], "select");
}

static void up_single_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_command(apps[current_app_num], "up");
}

static void down_single_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_command(apps[current_app_num], "down");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT,                     select_single_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP,                         up_single_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN,                       down_single_click_handler);
  window_long_click_subscribe(  BUTTON_ID_SELECT, LONG_CLICK_HOLD_MS, select_long_click_handler, NULL);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);

  header_text = text_layer_create((GRect) { .origin = { 5, 5 }, .size = { 115, 50 } });
  text_layer_set_text(header_text, "loading...");
  text_layer_set_font(header_text, fonts_get_system_font(FONT_KEY_GOTHIC_24));
  text_layer_set_overflow_mode(header_text, GTextOverflowModeFill);
  text_layer_set_text_color(header_text, GColorBlack);
  text_layer_set_background_color(header_text, GColorClear);
  layer_add_child(window_layer, text_layer_get_layer(header_text));

  main_text = text_layer_create((GRect) { .origin = { 5, 60 }, .size = { 115, 60 } });
  text_layer_set_text(main_text, "loading...");
  text_layer_set_font(main_text, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  text_layer_set_overflow_mode(main_text, GTextOverflowModeFill);
  text_layer_set_text_color(main_text, GColorBlack);
  text_layer_set_background_color(main_text, GColorClear);
  layer_add_child(window_layer, text_layer_get_layer(main_text));

  footer_text = text_layer_create((GRect) { .origin = { 5, 125 }, .size = { 115, 23 } });
  text_layer_set_text(footer_text, apps[current_app_num]);
  text_layer_set_font(footer_text, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_overflow_mode(footer_text, GTextOverflowModeFill);
  text_layer_set_text_color(footer_text, GColorBlack);
  text_layer_set_background_color(footer_text, GColorClear);
  layer_add_child(window_layer, text_layer_get_layer(footer_text));

  action_bar = action_bar_layer_create();
  action_bar_layer_add_to_window(action_bar, window);
  action_bar_layer_set_click_config_provider(action_bar, click_config_provider);

  update_select_icon();
  update_up_and_down_icons();
}

static void window_unload(Window *window) {
  action_bar_layer_destroy(action_bar);

  gbitmap_destroy(action_icon_play);
  gbitmap_destroy(action_icon_pause);
  gbitmap_destroy(action_icon_volume_up);
  gbitmap_destroy(action_icon_volume_down);
  gbitmap_destroy(action_icon_right_arrow);
  gbitmap_destroy(action_icon_left_arrow);

  window_destroy(window);
}

void action_window_init(int app_num) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Pushed action-window %d", app_num);

  current_app_num = app_num;

  send_command(apps[current_app_num], NULL);

  action_icon_play        = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_PLAY);
  action_icon_pause       = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_PAUSE);
  action_icon_volume_up   = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_VOLUME_UP);
  action_icon_volume_down = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_VOLUME_DOWN);
  action_icon_right_arrow = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_RIGHT_ARROW);
  action_icon_left_arrow = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_ACTION_LEFT_ARROW);

  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });

  const bool animated = true;
  window_stack_push(window, animated);
}
