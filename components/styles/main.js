
import { StyleSheet } from 'react-native'

export const fragment_font_default = {
  fontFamily: 'regular',
}

export const styles = theme => {
  return StyleSheet.create({
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
      width: theme.SIZES.NAVBAR_WIDTH,
    },
    header_block: {
      height: 96,
      alignSelf: 'flex-end',
    },
    auth_input: {
      ...fragment_font_default,
      width: theme.SIZES.INPUT_WIDTH,
      height: 100,
      alignContent: 'space-between',
    },
    conent_input: {
      ...fragment_font_default,
      width: theme.SIZES.INPUT_WIDTH,
      alignContent: 'space-between',
    },
    content_button: {
      ...fragment_font_default,
      width: theme.SIZES.INPUT_WIDTH,
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
      borderWidth: 0,
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
      textAlign: 'center',
    },
    list_block_item_actions: {
    },
    list_block_item_button: {
      ...fragment_font_default,
      width: 'auto',
    },
    error_block: {
      padding: theme.SIZES.BASE,
      marginTop: theme.SIZES.BASE,
      marginBottom: theme.SIZES.BASE * 2,
      backgroundColor: theme.COLORS.LIGHT_DANGER,
      borderColor: theme.COLORS.ERROR,
      width: theme.SIZES.ERROR_WIDTH,
      justifyContent: 'space-between',
    },
    error_block_close: {
      backgroundColor: 'rgba(254, 40, 100, 0.1)',
      borderWidth: 0,
      shadowOffset: 0,
      shadowRadius: 0,
      shadowOpacity: 0,
      margin: 0,
      padding: 0,
    },
    error_block_text: {
      ...fragment_font_default,
      color: theme.COLORS.ERROR,
      paddingTop: theme.SIZES.BASE * 2.5,
      paddingBottom: theme.SIZES.BASE * 2,
    }
  })
}