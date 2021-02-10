import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Card } from 'galio-framework'

import { Context } from '../../../context'
import { recordActions } from '../../../store'
import { decrypt } from '../../../utils/ledger/crypt'


export const PersonalList = connect(
  ({ record: { records }, wallet: { identity } }, ownProps) => ({ 
    records, 
    identity,
    ...ownProps 
  }),
  (dispatch, ownProps) => ({
    list: () => dispatch(recordActions.loadAll()),
    load: (records) => records.forEach(
      record => {
        if ('string' === typeof record) {
          dispatch(recordActions.load(record))
        }
      }
    ),
    ...ownProps
  }),
)(withGalio(({ list, load, records, identity }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))
  useEffect(useCallback(_ => { load(records) }, [records]))

  return <Block>
    {
      records.map(
        record => typeof record === 'string'
          ? <Card key={record}><Text>Record ID: {record}</Text></Card>
          : <Card key={record.id}
            title={record.key}
            caption={record.recordType}
          >
            <Text>{record.data}</Text>
            <Text>Signature: {record.signature}</Text>
            <Text>Type: {record.type}</Text>
            <Text>Publicity: {record.publicity}</Text>
            <Text>Status: {record.status}</Text>
            <Text>Provierd: {record.provider}</Text>
          </Card>
      )
    }
    <Button round uppercase onPress={() => navigation.navigate('')}>Read passport</Button>
  </Block>
}))