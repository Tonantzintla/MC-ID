import { base } from "$api/base";
import { requestCode } from "$api/routers/v1/codes/request/POST";
import { verifyCode } from "$api/routers/v1/codes/verify/POST";
import { getCode } from "$api/routers/v1/plugin/code/[userId]/GET";

export const router = base.prefix("/v1").router({
  plugin: {
    code: getCode
  },
  codes: {
    verify: verifyCode,
    request: requestCode
  }
});
