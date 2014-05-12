
/**
 * zinger.common.js
 */

angular.module('common.filters', []);
angular.module('common.factories', []);
angular.module('zinger.common', ['common.filters','common.factories']);

/**
 * filters
 */
angular.module('common.filters')
//全てのモジュールで利用するもの、公開して構わないソース
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        };
    })
    .filter('jpYen', function(){
        return function(text){
            var ret = "";

            if( text ) {
                var num = new String(text).replace(/,/g/"");
                while(num != (num =num.replace(/^(-?\d+)(\d{3})/,"$1,$2")));
                ret = "¥" + num;
            }
            return ret;
        }
    })
    .filter('nl2br', function(){
        return function(text){
            var ret = ( text ) ? text.nl2br() : "";
            return ret;
        };
    })
    // ex) {{ contents | ellipsis:20 }} パラメータを渡す
    .filter('ellipsis', function(){
        return function(text, max){
            var ret = "";

            if( text.length > max ){
                ret = text.substr(0, max) + '...';
                return ret;
            } else {
                return text;
            }
        };
    // ex) {{ contents | rangeExpand:20:30 }} パラメータを渡す
    }).filter('rangeExpand', function() {
        return function(input, start, end) {
            end = parseInt(end);
            for (var i=start; i<=end; i++)
                input.push(i);
            return input;
        };
    }).filter('decode', function(){
        return function(target){
            return decodeURIComponent(target);
        }
    }).filter('escapeHtml', function(){
        return function(text){
            var ret = ( text ) ? (function(){
                text=text.replace(/&/g,'&amp;');
                text=text.replace(/"/g,"&quot;");
                text=text.replace(/'/g,"&#039;");
                text=text.replace(/>/g,'&gt;');
                text=text.replace(/</g,'&lt;');
                return text;
            }()) : "";

            return ret;
        };
    }).filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });

/**
 * factories
 */
angular.module('common.factories')
//固定値
.factory('Fixed', function(){
    return {
        RESPONSE_SUCCESS : 'success',
        RESPONSE_FAILED : 'fail',
        HEADER_XCSRF : 'x-csrf-token'
    };
})
.factory('request',['Fixed',
function(Fixed){
    var header = {};
    return {
        get : function(url, csrf_token, success, param){
            var params =  {
                method : "GET",
                url : url
            };

            if( !!csrf_token ){
                header[Fixed.HEADER_XCSRF] = csrf_token;
                params['headers'] = header;
            }

            if( !!param ) params['params'] = param;

            return {
                params : params,
                success : success,
                error : function(data, status){ console.log('request error'); }
            }
        },
        post : function(url, csrf_token, data, success){
            header[Fixed.HEADER_XCSRF] = csrf_token;

            var params = {
                method : "POST",
                url : url,
                data : data ,
                headers : header
            };

            return {
                params : params,
                success : success,
                error : function(data, status){ console.log('request error'); }
            }
        }
    }
}])
.factory('judgeItemFlag',function(){
    return {

        /*
         * newを出すかどうか？を決める(２週間以内の登録)
         */
        'isNewItem' : function($created){
            var ret, crtd, later;

            if( !!$created.sec && !isNaN(parseInt($created.sec, 10))) {
                crtd = new Date($created.sec * 1000);
                later = new Date();
                later.setDate(later.getDate() - 14);

               if(crtd > later){ ret = true; }
            }

            return !!ret;
        },

        /*
         * 非売品かどうか item.typeをみて判断
         */
        'isNotOnSales' : function($type){
            return ( !!$type && $type == 'not_sale');
        },

        /*
         * 在庫切れの判定
         * バリエーションなしの場合：
         *	基本情報の方で無制限フラグが立っているか、在庫が1つでもあればOK、
         * バリエーションがある場合：
         *   基本情報は見ないで、バリエーションの中で無制限フラグが立っているものや、
         *	在庫が一つでもある場合は表示する。
         *
         * ↑の条件を満たさないなら全てsoldoutにする。
         */
        'isSoldOut' : function($stock, $is_ul, $variation){
            var ret = true;

            if( !!$variation && $variation.length > 0 ) {
                for( var v in $variation) if($variation.hasOwnProperty(v) && ret) {
                    var _curVari = $variation[v];
                    if(_curVari.is_ul === true || ( !!_curVari.st && !isNaN(parseInt(_curVari.st, 10)) && _curVari.st > 0 )) {
                        ret = false;
                    }
                }
            } else {
                ret = ( !$is_ul && !isNaN(parseInt($stock, 10)) && $stock === 0 );
            }

            return ret;
        }
    }
});

/**
 * Pure Javascriptの拡張
 */
/*
* toLocaleString のフォーマットを統一する
*/
Date.prototype.toLocaleString = function()
{
    var ts = arguments[0] || false, 
        dm = arguments[1] || '/' ;

    return [
        this.getFullYear(),
        this.getMonth() + 1,
        this.getDate()
        ].join( dm ) 
        + ( ( ts === true ) ? ' ' + this.toLocaleTimeString() : '' ) ;
};
/*
* phpのarray_chunkみたいなの。
*
*/
Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
};
//nl2br
String.prototype.nl2br = function(){ 
    return this.replace(/(\r\n|\r|\n)/g, '<br />'); 
};
/**
 * ブラウザによってObject.keysがないもののために用意
 */

Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;

    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");

        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }

        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }
        }

        return result;
    };
})();

//trim 関数のprototype拡張
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.ltrim = function() {
    return this.replace(/^\s+/, "");
};
String.prototype.rtrim = function() {
    return this.replace(/\s+$/, "");
};

//console APIのないものはconsole.logがなにもしないように
window.console = window.console || (function(){
    var _dummy_func = function(dummy){ return false; };
    //これ以上は使わないだろうと
    return {
        log : _dummy_func,
        dir : _dummy_func

    }
})();

/**
 * jQueryの拡張
 */
$.extend({
    // 先頭空白文字列を削除
    ltrim: function(text) {
        return (text || "").replace(/^\s+/g, "");
    },

    // 末尾空白文字列を削除
    rtrim: function(text) {
        return (text || "").replace(/\s+$/g, "");
    }
});
