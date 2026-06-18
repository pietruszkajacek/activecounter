
export const googleScriptRun = <resType>(
  fnName: string,
  success: (response: resType) => void,
  failure: (error: Error) => void,
  params: unknown[]
) => {
  google.script.run
    .withSuccessHandler(success)
    .withFailureHandler(failure)[fnName](...params);
};
