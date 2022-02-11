enchant();

var game;
var player, enemy, bullet, eBullet;
var pad;
var spritelist =[];
var score = 0;

/**配列の要素を削除するメソッド*/
Array.prototype.remove = function( elm ) {
	var index = this.indexOf( elm );
	this.splice( index, 1 );
	return this;
}

//Webページが読み込まれたら
addEventListener('load', function(){
    //ゲームオブジェクト作成
    game = new Game(320,320);
    //使う画像をロード
    game.preload('img/character/player.png','img/character/inbader.png',
    'img/character/bullet.png','img/character/enemybullet.png','img/bg/space.jpg'); 
    //キー設定（コントローラーのAボタンをキーボードのZに割り当てる）
    game.keybind('Z'.charCodeAt(0),'a');

    //ゲームオブジェクトが読み込まれたら
    game.addEventListener('load', function(){
        game.pushScene(game.mainScene());
    });

    //メインシーン設定
    game.mainScene = function(){
        var scene = new Scene();
        //背景を黒
        scene.backgroundColor = 'black';

        //背景画像
        bg( scene );

        //プレーヤーを追加
        player = new Player();
        spritelist.push(player);
		//scene.addChild( playerSprite );

        // 弾を打つ関数
        var hitbullet = function() {
            bullet = new Bullet();
            spritelist.push(bullet);
        }

        var firebullet = function() {
            var rndx = Math.floor( Math.random()*10);
//            if(rndx % 3 === 0){
            for(var i=0; i<spritelist.length; i++) {
                var character = spritelist[i];
                console.log("リスト数"+spritelist.length);
                if(character === player) console.log("自機"+i);
                if(character === enemy) console.log("敵キャラ"+i);
    
                if(character === enemy){
                    console.log("敵キャラx座標"+character.x);
                    //if(character.x > 30 && character.x < 180) {
                        eBullet = new EnemyBullet(character.x, character.y);
                        spritelist.push(eBullet);
                    //}
                }
            }
        }

        // スコアラベル
        var scorelabel = new Label();
        scorelabel.font = "20px 'Russo one', sans-serif";

        // アナログパッド設定
        pad = new APad();
        pad.x = 0;
        pad.y = 220;
        scene.addChild( pad );

        //setInterval(firebullet, 5000);

        // シーン更新ごとに呼び出す
        scene.onenterframe = function(){

            //30フレーム毎に敵を生成する
            if(game.frame % 30 === 0) {
                // 敵を生成
                enemy = new Enemy();
                spritelist.push(enemy);
                //scene.addChild(enemy);
            }

            if(game.frame % 15 === 0){
                var enemyx = Math.floor( Math.random()*10);
                //if(enemyx % 4 ===0) 
                firebullet();
            }
    
            scorelabel.text = 'Score : ' + score;
            scorelabel.y = 10;
            scorelabel.color = 'white';
            scene.addChild(scorelabel);

            for(var i=0; i<spritelist.length; i++){
                scene.addChild(spritelist[i]);
            }
            if(game.frame % 10 === 0){
                //弾を打つ
                if(game.input.a) hitbullet();
            }
            // 画面タッチで弾を打つ
            this.addEventListener('touchstart', hitbullet);
        }        
        return scene;
    }

    // GAME START
    game.start();
});

// プレーヤークラス
var Player = Class.create ( Sprite, {
    initialize : function(){
		/**スプライトの表示**/
        // 画像サイズを考慮する事
        Sprite.call( this, 40, 35 );
		this.image = game.assets[ 'img/character/player.png' ];
        this.x = 130;
        this.y = 250;
    },

    // 矢印キー、またはアナログパッドの操作
    onenterframe: function(){
        var speed = 7;
        if(game.input.left)  this.x -= speed;
        if(game.input.right) this.x += speed;
        if(game.input.down)  this.y += speed;
        if(game.input.up)    this.y -= speed;

        // 行動範囲の制限
        if(this.x < 0) this.x =0;
        if(this.x >= 280) this.x =280;
        if(this.y < 170) this.y =170;
        if(this.y >= 280) this.y =280;

        //アナログパッドの移動
        if ( pad.isTouched ) {
            this.x += pad.vx * speed;
            this.y += pad.vy * speed;
        }
    } 
});

// 敵キャラクラス
var Enemy = Class.create( Sprite, {
    //初期化処理
    initialize : function(){
        this.existance = 1;
        Sprite.call(this, 39, 29);
        this.image = game.assets[ 'img/character/inbader.png' ];
        var rnd = Math.random() * (100);
        this.moveTo(300, 20 + rnd);
    },
    // 敵キャラの移動
    onenterframe: function(){
        this.x -= 3;

        if(this.x < -50 || this.existance === 0){
            this.parentNode.removeChild(this);
            spritelist.remove(this);
        }
    }
});

// 弾丸クラス
var Bullet = Class.create( Sprite,{

    initialize: function(){
        var bulletX, bulletY;
        this.existance = 1;
        Sprite.call(this,20,28);
        this.image = game.assets[ 'img/character/bullet.png' ];

        // プレイヤーの位置から弾の発射位置を決める（自機の頭から発射）
        this.speed = 8;
        bulletX = player.x + 10;
        bulletY = player.y - 20;

        this.moveTo(bulletX, bulletY);
    },

    //弾の移動
    onenterframe: function(){
        this.y -= this.speed;

        if(this.y < -20 || this.existance === 0){
            this.parentNode.removeChild(this);
            spritelist.remove(this);
        }

        for(var i=0; i<spritelist.length; i++){
            var sprite = spritelist[i];

            if(sprite === player) continue;
            if(sprite === this) continue;
            if(this.intersect(sprite)){
                sprite.existance = 0;
                this.existance = 0;
                score += 200;
            }
        }
    }

});

// 弾丸(敵)クラス
var EnemyBullet = Class.create( Sprite,{

    initialize: function(x,y){
        var ebulletX, ebulletY;
        this.existance = 1;
        Sprite.call(this,15,23);
        this.image = game.assets[ 'img/character/enemybullet.png' ];

        // 敵キャラの位置から弾の発射位置を決める
        this.speed = 5;
        ebulletX = x;
        ebulletY = y;

        this.moveTo(ebulletX, ebulletY);
    },

    //弾の移動
    onenterframe: function(){
        this.y += this.speed;

        if(this.y > 300 || this.existance === 0){
            this.parentNode.removeChild(this);
            spritelist.remove(this);
        }

        /*for(var i=0; i<spritelist.length; i++){
            var sprite = spritelist[i];

            if(sprite === enemy) continue;
            if(sprite === this) continue;
            if(this.intersect(sprite)){
                sprite.existance = 0;
                this.existance = 0;
            }
        }*/
    }

});

//背景の処理
var bg = function(scene){

    var space  = new Sprite(320, 320);
    space.image = game.assets[ 'img/bg/space.jpg' ];
    scene.addChild(space);
}

