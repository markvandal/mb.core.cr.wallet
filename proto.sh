. .env

./node_modules/protobufjs/bin/pbjs -t json -p $METABELARUS_PATH/proto/ \
$METABELARUS_PATH/proto/mbcorecr/invite.proto \
$METABELARUS_PATH/proto/mbcorecr/identity.proto \
$METABELARUS_PATH/proto/mbcorecr/query.proto \
$METABELARUS_PATH/proto/crsign/auth.proto \
$METABELARUS_PATH/proto/crsign/record.proto \
$METABELARUS_PATH/proto/crsign/query.proto \
>proto.json
