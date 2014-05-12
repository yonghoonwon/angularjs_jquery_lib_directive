(function ($) {
angular.module('module.name', [
	'sub.module.name', 'blueimp.fileupload', 'ngCookies'
])
.directive('focusOn', function() {
    return function(scope, elem, attr) {
        scope.$on('focusOn', function(e, name) {
            if(name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
})
.factory('focus', function ($rootScope, $timeout) {
    return function(name) {
        $timeout(function (){
            $rootScope.$broadcast('focusOn', name);
        });
    }
})
.directive('ngMinimalect', ['$parse', function($parse){
    return {
        compile : function(element, $attributes){
            var $model = $parse($attributes['ngModel']);

            return function($scope, element, $attrs) {
                var hasModel = $attrs['ngModel'],
                    _action = function(value, text) {

                        // elementにredirect="1"のように記載した場合
                        // 指定したvalueでリダイレクトする
                        if( !!$attrs.redirect ) {
                            $(location).attr('href', value);

                        // モデルを持っててredirect指定の無い場合は
                        // 選択された値をmodelに反映させる
                        } else if( hasModel && !$scope.$$phase ){
                            $scope.$apply(function() {
                                $model.assign($scope, value);
                            });
                        }
                    },
                    _option = { onchange : _action, placeholder : '選択してください' };

                element.minimalect(_option);
            };
        }
    }
}])

.directive('ngConfirmClick', [
function(){
    return {
        link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.confirmedClick;
            element.bind('click',function (event) {
                if ( window.confirm(msg) ) {
                    scope.$eval(clickAction)
                }
            });
        }
    };
}])
.directive('iCheck', ['$parse', function($parse) {
    return {
        priority:1,
        compile: function(element, $attributes) {
            var $model = $parse($attributes['ngModel']),
                _options = {
                    checkboxClass: 'icheckbox_flat-blue',
                    radioClass: 'iradio_flat-blue'
                };

            return function($scope, element, $attrs) {
                var $value = $attrs['value'],
                    $hasModel = $attrs['ngModel'],
                    _action = function(event) {
                        if ( $hasModel && $(element).attr('type') === 'checkbox' ) {
                            (!$scope.$$phase) && $scope.$apply(function() {
                                $model.assign($scope, event.target.checked);
                            });
                        } else if ( $hasModel && $(element).attr('type') === 'radio' ) {
                            (!$scope.$$phase) && $scope.$apply(function() {
                                $model.assign($scope, $value);
                            });
                        }
                    };

                $scope.$watch($model, function (val) {
                    var action = val ? 'check' : 'uncheck';
                    element.iCheck(_options, action).on('ifChanged', _action);
                });
            };
        }
    };
}])
.directive('iCheckToggleVisible', ['$parse', function($parse) {
    return {
        priority:0,
        compile: function(element, $attributes) {
            var $model = $parse($attributes['ngModel']);

            return function($scope, element, $attrs) {
                $scope.$watch($model, function (val) {

                    // elementに指定したi-target attributeよりターゲットを決める(class名)
                    // i-targetにはclass名だけ指定するように
                    var _target = $('.'+$attrs.iTarget).parent(),
                        option = 'disabled',
                        method = (val == 'not_sale') ? 'addClass' : 'removeClass';

                        _target[method](option);
                });
            };
        }
    };
}])
.directive('ngSlideDown', function() {
    return function(scope, element, attr) {
        element.effect("highlight", {}, 500);
        return scope.destroy = function(complete) {
            return element.slideDown(10000, function() {
                if (complete) {
                    return complete.apply(scope);
                }
            });
        };
    };
})
// 商品リスト一覧のToggle Switch用のdirective
.directive('jToggles', ['$parse', function($parse){
    return {

        //ng-clickより優先させるために100に設定
        priority: 100,
        compile : function(element, $attributes){
            var $model = $parse($attributes['ngModel']),
                options = {
                    'animate' : 200,
                    'width': 90, // width used if not set in css
                    'height': 35, // height if not set in css
                    'drag' : false
                },
                statusBoolean = { active : true, closed : false, stop : null };

            return function($scope, element, $attrs){

                // エラー発生時、スイッチの状態を戻す際、
                // 他の処理を走らせないためのフラッグ
                var allowed = true;

                $scope.$watch($model, function(val){

                    //生のステータス値と判定用のステータス値
                    var rawStatus = val.is_st,
                        status = statusBoolean[ rawStatus ];

                    if ( typeof status != 'boolean' ) {

                        //ステータスが停止の場合
                        $.extend(options, {
                            'click' : false, 'on' : false,
                            'text' : { 'off' : '停止' }
                        });

                    } else {

                        //ステータスが開閉の場合
                        $.extend(options, {
                            'on' :  status, 'click' : true,
                            'text' : {on:'公開',off:'非公開'}
                        });

                        // override ng-click on/off 切り替え
                        //itemListCtrlのscopeのメソッドを使わせる
                        element.bind('click', function(){
                            var _el = $model($scope),
                                _handler = function(){

                                    //triggerによるclick時には処理させない
                                    ( allowed ) && $scope.change_status(_el, function(result){

                                        //responseが失敗の際
                                        if( !result ){
                                            allowed = false;
                                            element.find('.toggle-off').trigger('click');
                                        }
                                    });

                                    //正常な処理へ初期化
                                    allowed = true;

                                };

                            (!$scope.$$phase) ? $scope.$apply(_handler) : _handler();

                        });
                    }

                    // jQuery Module 初期化
                    element.children().toggles(options);
                });
            }
        }
    }
}]);

}(jQuery));

