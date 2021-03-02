
import { StyleSheet } from 'react-native'

export const fragment_font_default = {
  fontFamily: 'regular',
}

export const styles = theme => StyleSheet.create({
  app_text: {
    ...fragment_font_default,
    fontSize: 16,
  },
  app_info: {
    ...fragment_font_default,
    fontSize: 10,
  },
  header_block_title: {
    fontSize: 20,
    fontFamily: 'bold',
  },
  header_logo: {
    width: 48,
    height: 48,
  },
  header: {
    height: 144,
  },
  header_block: {
    height: 96,
    alignSelf: 'flex-end',
  },
  content_input: {
    ...fragment_font_default,
    width: theme.SIZES.INPUT_WIDTH,
    height: 100,
    alignContent: 'space-between',
  },
  content_button: {
    ...fragment_font_default,
  },
  list_block_main: {
    width: theme.SIZES.INPUT_WIDTH,
    alignItems: 'stretch',
    padding: theme.SIZES.BASE,
  },
  list_block_item: {
    padding: theme.SIZES.BASE,
  },
  list_block_item_label: {
    alignContent: 'space-between',
  },
  list_block_item_label_caption: {
    ...fragment_font_default,
    fontSize: 16,
    flex: 1,
  },
  list_block_item_label_info: {
    ...fragment_font_default,
    color: theme.COLORS.GRAY,
    flex: 1,
  },
  list_block_item_header: {
    alignContent: 'space-between',
    backgroundColor: theme.COLORS.TINTED,
    padding: theme.SIZES.BASE * 2,
  },
  list_block_item_header_odd: {
    alignContent: 'space-between',
    padding: theme.SIZES.BASE * 2,
  },
  list_block_item_content: {
    alignContent: 'space-between',
    padding: theme.SIZES.BASE * 2,
  },
  list_block_item_caption: {
    ...fragment_font_default,
    fontSize: 14,
    flex: 2,
  },
  list_block_item_info: {
    ...fragment_font_default,
    color: theme.COLORS.GRAY,
    textAlign: 'right',
    fontSize: 10,
    flex: 1,
  },
  list_block_item_label_value: {
    ...fragment_font_default,
    fontSize: 16,
    flex: 1,
  },
  list_block_card: {
    margin: theme.SIZES.BASE,
  },
  list_block_title: {
    fontSize: 20,
    fontFamily: 'bold',
    alignSelf: 'center',
  },
  list_block_item_actions: {
    justifyContent: 'flex-end',
  },
})