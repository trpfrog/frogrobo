# frogrobo

つまみさんの Twitter bot [@FrogRobo](https://twitter.com/FrogRobo) のリポジトリです。

## ⚠️ 注意

この bot はつまみさんの 2019 年以降のツイートで fine-tuning + 語彙を若干拡張した GPT-2 モデル (base: [rinna/japanese-gpt2-medium](https://https://huggingface.co/rinna/japanese-gpt2-medium)) でお喋りする機能があります。(いわゆる AI です)

**なぜか過激発言ばかりする**ので注意してください。また、問題のあるツイートを発見した場合は管理者 (@TrpFrog) までご一報ください。

## 機能

### ランダムツイート

TL のツイートを拾って GPT-2 で喋ります。
プロンプトは以下の通りです。

```text
「[拾ったツイートの本文]」わし「
```

です。

### リプライ

リプライを受け取ると、そのツイートに上記の GPT-2 で返信します。プロンプトは以下の通りです。

```text
「[リプライツリーの大元]」「[リプライ]」「[そのリプライ]」... わし「
```

### ランダムつまみアイコン

ちくわぶ (@Prgckwb) さんの訓練したつまみアイコンを作る Diffusion モデル [headmaking/trpfrog-icons](https://huggingface.co/headmaking/trpfrog-icons) でつまみアイコンを生成してツイートします。プロンプトは以下の通りです。

```text
an icon of trpfrog
```

### 音楽配信サービスのリンク集返すやつ

- `#nowplaying` を含むツイートである
- リンクを含むツイートである
- つまみロボへのメンションである

上記の条件をすべて満たしたツイートに対して、[Songwhip](https://songwhip.com/) を使ってリンク集を返します。
