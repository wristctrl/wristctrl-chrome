#include "common.h"

int num_of_apps = 0;
char apps[8][64];

extern MenuLayer* menu_layer;
extern TextLayer* loading_text_layer;

extern TextLayer* header_text;
extern TextLayer* main_text;

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
        text_layer_set_text(loading_text_layer, ""); // clear out loading
        num_of_apps = t->value->int16;
        menu_layer_reload_data(menu_layer);
      case KEY_TEXT_MAIN:
        APP_LOG(APP_LOG_LEVEL_INFO, "Update Text Main %s", t->value->cstring);
        if(main_text != NULL) {
          text_layer_set_text(main_text, t->value->cstring);
        }
        break;
      case KEY_TEXT_HEADER:
        APP_LOG(APP_LOG_LEVEL_INFO, "Update Text Header %s", t->value->cstring);
        if(header_text != NULL) {
          text_layer_set_text(header_text, t->value->cstring);
        }
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

void send_command(char* app, char* button) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Message Sent!");
  DictionaryIterator* outbox_iter;
  if (app_message_outbox_begin(&outbox_iter) != APP_MSG_OK){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "opening outbox failed\n");
    return;
  }

  if(outbox_iter == NULL){
    return;
  }

  dict_write_cstring(outbox_iter, KEY_COMMAND_APP, app);
  if(button != NULL) {
    dict_write_cstring(outbox_iter, KEY_COMMAND_BUTTON, button);
  }

  if(dict_write_end(outbox_iter) == 0){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "the parameters for writing were invalid" );
  }

  app_message_outbox_send();
}

void app_message_init(){
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

