#include "common.h"

static Window* window;
static MenuLayer* menu_layer;

static int num_of_apps = 0;
static char apps[8][64];

typedef enum {
  KEY_APP_1 = 0x0,
  KEY_APP_2 = 0x1,
  KEY_APP_3 = 0x2,
  KEY_APP_4 = 0x3,
  KEY_APP_5 = 0x4,
  KEY_APP_6 = 0x5,
  KEY_APP_7 = 0x6,
  KEY_APP_8 = 0x7,
  KEY_APP_COUNT = 0x8
} MessageKey;

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Message received!");

  Tuple *t = dict_read_first(iterator);

  // Process all pairs present
  while (t != NULL) {
    // Process this pair's key
    switch (t->key) {
      case KEY_APP_1:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[0], sizeof(apps[0]), t->value->cstring);
        break;
      case KEY_APP_2:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[1], sizeof(apps[1]), t->value->cstring);
        break;
      case KEY_APP_3:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[2], sizeof(apps[2]), t->value->cstring);
        break;
      case KEY_APP_4:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[3], sizeof(apps[3]), t->value->cstring);
        break;
      case KEY_APP_5:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[4], sizeof(apps[4]), t->value->cstring);
        break;
      case KEY_APP_6:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[5], sizeof(apps[5]), t->value->cstring);
        break;
      case KEY_APP_7:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[6], sizeof(apps[6]), t->value->cstring);
        break;
      case KEY_APP_8:
        APP_LOG(APP_LOG_LEVEL_INFO, "Message received! %s", t->value->cstring);
        snprintf(apps[7], sizeof(apps[7]), t->value->cstring);
        break;
      case KEY_APP_COUNT:
        APP_LOG(APP_LOG_LEVEL_INFO, "Update count: %d", t->value->int16);
        num_of_apps = t->value->int16;
        menu_layer_reload_data(menu_layer);
        break;
    }

    // Get next pair, if any
    t = dict_read_next(iterator);
  }
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

static void send_msg() {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Message Sent!");
  /* DictionaryIterator* outbox_iter; */
  /* if (app_message_outbox_begin(&outbox_iter) != APP_MSG_OK){ */
  /*   APP_LOG(APP_LOG_LEVEL_DEBUG, "opening outbox failed\n"); */
  /*   return; */
  /* } */
  /*  */
  /* if(outbox_iter == NULL){ */
  /*   return; */
  /* } */
  /*  */
  /* dict_write_cstring(outbox_iter, KEY_MSG, "toggle"); */
  /*  */
  /* if(dict_write_end(outbox_iter) == 0){ */
  /*   APP_LOG(APP_LOG_LEVEL_DEBUG, "the parameters for writing were invalid" ); */
  /* } */
  /*  */
  /* app_message_outbox_send(); */
}

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
  action_window_init();
}

static void window_load(Window* window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_frame(window_layer);

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
  menu_layer_destroy(menu_layer);
}

static void init(void) {
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

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
