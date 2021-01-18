import React from 'react';



import { 
  theme, 
  withGalio, 
  GalioProvider, 
  Block, 
  Text, 
  Input 
} from 'galio-framework'

export const WalletAuth = () => 
  <Block>
    <Input color={theme.COLORS.THEME} 
          icon="heart"
          family="antdesign"
          iconSize={14}
          iconColor="red" 
          style={{ borderColor: theme.COLORS.THEME }}
          value="" />
  </Block>