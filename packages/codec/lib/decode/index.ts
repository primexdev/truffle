import debugModule from "debug";
const debug = debugModule("codec:decode");

import * as Format from "@truffle/codec/format";
import * as Pointer from "@truffle/codec/pointer";
import * as Elementary from "@truffle/codec/elementary";
import * as Evm from "@truffle/codec/evm";
import { DecoderRequest, DecoderOptions } from "@truffle/codec/types";
import decodeMemory from "./memory";
import * as Storage from "@truffle/codec/storage";
import * as Special from "@truffle/codec/special";
import decodeStack from "./stack";
import { decodeLiteral } from "./stack";
import decodeAbi from "./abi";
import decodeTopic from "./event";

export default function* decode(
  dataType: Format.Types.Type,
  pointer: Pointer.DataPointer,
  info: Evm.EvmInfo,
  options: DecoderOptions = {}
): Generator<DecoderRequest, Format.Values.Result, Uint8Array> {
  debug("type %O", dataType);
  debug("pointer %O", pointer);

  switch (pointer.location) {
    case "storage":
      return yield* Storage.Decode.decodeStorage(dataType, pointer, info);

    case "stack":
      return yield* decodeStack(dataType, pointer, info);

    case "stackliteral":
      return yield* decodeLiteral(dataType, pointer, info);

    case "definition":
      return yield* Elementary.Decode.decodeConstant(dataType, pointer, info);

    case "special":
      return yield* Special.Decode.decodeSpecial(dataType, pointer, info);

    case "calldata":
    case "eventdata":
      return yield* decodeAbi(dataType, pointer, info, options);

    case "eventtopic":
      return yield* decodeTopic(dataType, pointer, info, options);

    case "memory":
      //NOTE: this case should never actually occur, but I'm including it
      //anyway as a fallback
      return yield* decodeMemory(dataType, pointer, info);
  }
}
