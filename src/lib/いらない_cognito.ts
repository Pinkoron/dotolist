import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
// ✅ AWS Cognito の JS SDK から3つのクラスをインポート
// - CognitoUser: ユーザー認証などに使うユーザーオブジェクト
// - AuthenticationDetails: 認証（ログイン）用のユーザー名とパスワードをまとめるクラス
// - CognitoUserPool: ユーザープール（ログイン対象のCognitoプール）を表すクラス

console.log("UserPoolId:", process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
console.log("ClientId:", process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID);
//環境変数はnextでは「process.env」で標準で取得できる

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};
// 認証に使う「ユーザープールID」と「クライアントID」を1つのオブジェクトにまとめておく

const userPool = new CognitoUserPool(poolData);
// ✅ CognitoUserPool のインスタンスを作成（どのCognitoにログインするか指定するイメージ）
// ✅ これがログイン時に参照されるプール情報になる

type AuthTokens = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
};

export async function login(
  email: string,
  password: string
): Promise<AuthTokens> {
  // ✅ Cognitoに対してログインを試みる
  // ✅ 成功・失敗・特別対応などの結果に応じてコールバックで処理する

  const user = new CognitoUser({ Username: email, Pool: userPool });
  //ログイン対象を用意している
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });
  //ログインに使う認証情報（emailとpassword）をCognitoの形式で定義している

  return new Promise((resolve, reject) => {
    // ✅ この関数の呼び出し側で `await login()` できるようにするために Promise にしてる
    user.authenticateUser(authDetails, {
      //CognitoUserのインスタンス.authenticateUser(認証情報,{})
      // ✅ authDetails（メール＋パスワード）を使って、ログインできるか確認する
      onSuccess: (result) => {
        resolve({
          idToken: result.getIdToken().getJwtToken(),
          accessToken: result.getAccessToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => reject(err),

      // ✅ 仮パスワードの場合に新しいパスワードとして再送信
      newPasswordRequired: () => {
        user.completeNewPasswordChallenge(
          password,
          {},
          {
            onSuccess: (result) => {
              resolve({
                idToken: result.getIdToken().getJwtToken(),
                accessToken: result.getAccessToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken(),
              });
            },
            onFailure: (err) => reject(err),
          }
        );
      },
    });
  });
}
