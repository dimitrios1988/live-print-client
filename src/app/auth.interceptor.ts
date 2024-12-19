import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyMyBhcHBsaWNhdGlvbiIsInN1YiI6ImRpbWl0cmlvczE5ODgiLCJleHAiOjE3MzUwMzI2MDEsImlhdCI6MTczNDQyNzgwMSwiYWRtaW4iOnRydWUsImxvZ2luSWQiOjEsIm5vQXV0aCI6ZmFsc2V9.-wFynv3wN_1bTZ6N83tr3Kh1MjDkLM8x8uExPMlUKkA';

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(clonedRequest);
};
