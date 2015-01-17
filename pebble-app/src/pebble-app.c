#include "common.h"

static Window* window;

MenuLayer* menu_layer;
TextLayer* loading_text_layer;

extern int num_of_apps;
extern char apps[8][64];

static uint16_t menu_get_num_sections_callback(MenuLayer* menu_layer, void* data) {
  return 1;
}

static uint16_t menu_get_num_rows_callback(MenuLayer* menu_layer, uint16_t section_index, void* data) {
  return num_of_apps;
}

static int16_t menu_get_header_height_callback(MenuLayer* menu_layer, uint16_t section_index, void* data) {
  return MENU_CELL_BASIC_HEADER_HEIGHT;
}

static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
  menu_cell_basic_header_draw(ctx, cell_layer, "Wrist Control Apps");
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
  menu_cell_basic_draw(ctx, cell_layer, apps[cell_index->row], NULL, NULL);
}

static void menu_select_callback(MenuLayer* menu_layer, MenuIndex* cell_index, void* data) {
  action_window_init(cell_index->row);
}

static void window_load(Window* window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_frame(window_layer);

  loading_text_layer = text_layer_create(bounds);
  text_layer_set_text(loading_text_layer, "loading apps...");

  layer_add_child(window_layer, text_layer_get_layer(loading_text_layer));

  menu_layer = menu_layer_create(bounds);

  // Set all the callbacks for the menu layer
  menu_layer_set_callbacks(menu_layer, NULL, (MenuLayerCallbacks){
    .get_num_sections = menu_get_num_sections_callback,
    .get_num_rows = menu_get_num_rows_callback,
    .get_header_height = menu_get_header_height_callback,
    .draw_header = menu_draw_header_callback,
    .draw_row = menu_draw_row_callback,
    .select_click = menu_select_callback
  });

  menu_layer_set_click_config_onto_window(menu_layer, window);

  layer_add_child(window_layer, menu_layer_get_layer(menu_layer));
}

static void window_unload(Window* window) {
  text_layer_destroy(loading_text_layer);
  menu_layer_destroy(menu_layer);
}

static void init(void) {
  app_message_init();

  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
