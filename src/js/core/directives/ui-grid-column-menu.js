(function(){

angular.module('ui.grid')
.service('uiGridColumnMenuService', [ 'i18nService', 'uiGridConstants', 'gridUtil', 
function ( i18nService, uiGridConstants, gridUtil ) {
/**
 *  @ngdoc service
 *  @name ui.grid.service:uiGridColumnMenuService
 *
 *  @description Services for working with column menus, factored out
 *  to make the code easier to understand
 */

  var service = {
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name initialize
     * @description  Sets defaults, puts a reference to the $scope on 
     * the uiGridController
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {controller} uiGridCtrl the uiGridController for the grid
     * we're on
     * 
     */
    initialize: function( $scope, uiGridCtrl ){
      $scope.grid = uiGridCtrl.grid;

      // Store a reference to this link/controller in the main uiGrid controller
      // to allow showMenu later
      uiGridCtrl.columnMenuScope = $scope;
      
      // Save whether we're shown or not so the columns can check
      $scope.menuShown = false;
    },
    
    
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name setColMenuItemWatch
     * @description  Setup a watch on $scope.col.menuItems, and update
     * menuItems based on this.  $scope.col needs to be set by the column
     * before calling the menu.
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {controller} uiGridCtrl the uiGridController for the grid
     * we're on
     * 
     */    
    setColMenuItemWatch: function ( $scope ){
      var deregFunction = $scope.$watch('col.menuItems', function (n, o) {
        if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
          n.forEach(function (item) {
            if (typeof(item.context) === 'undefined' || !item.context) {
              item.context = {};
            }
            item.context.col = $scope.col;
          });

          $scope.menuItems = $scope.defaultMenuItems.concat(n);
        }
        else {
          $scope.menuItems = $scope.defaultMenuItems;
        }
      }); 
      
      $scope.$on( '$destroy', deregFunction );     
    },


    /**
     * @ngdoc boolean
     * @name enableSorting
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) True by default. When enabled, this setting adds sort
     * widgets to the column header, allowing sorting of the data in the individual column.
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name sortable
     * @description  determines whether this column is sortable
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * 
     */    
    sortable: function( $scope ) {
      if ( $scope.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
        return true;
      }
      else {
        return false;
      }
    },
    
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name isActiveSort
     * @description  determines whether the requested sort direction is current active, to 
     * allow highlighting in the menu
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {string} direction the direction that we'd have selected for us to be active
     * 
     */  
    isActiveSort: function( $scope, direction ){
      return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && 
              typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === direction);
      
    },
    
    /**
     * @ngdoc boolean
     * @name suppressRemoveSort
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) False by default. When enabled, this setting hides the removeSort option
     * in the menu.
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name suppressRemoveSort
     * @description  determines whether we should suppress the removeSort option
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * 
     */  
    suppressRemoveSort: function( $scope ) {
      if ($scope.col && $scope.col.colDef && $scope.col.colDef.suppressRemoveSort) {
        return true;
      }
      else {
        return false;
      }
    },       


    /**
     * @ngdoc boolean
     * @name disableHiding
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) False by default. When enabled, this setting prevents a user from hiding the column
     * using the column menu or the grid menu.
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name hideable
     * @description  determines whether a column can be hidden, but checking the disableHiding columnDef option
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * 
     */  
    hideable: function( $scope ) {
      if (typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.colDef && $scope.col.colDef.disableHiding) {
        return false;
      }
      else {
        return true;
      }
    },     


    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name getDefaultMenuItems
     * @description  returns the default menu items for a column menu
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * 
     */     
    getDefaultMenuItems: function( $scope ){
      return [
        {
          title: i18nService.getSafeText('sort.ascending'),
          icon: 'ui-grid-icon-sort-alt-up',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.ASC);
          },
          shown: function () {
            return service.sortable( $scope );
          },
          active: function() {
            return service.isActiveSort( $scope, uiGridConstants.ASC);
          }
        },
        {
          title: i18nService.getSafeText('sort.descending'),
          icon: 'ui-grid-icon-sort-alt-down',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.DESC);
          },
          shown: function() {
            return service.sortable( $scope );
          },
          active: function() {
            return service.isActiveSort( $scope, uiGridConstants.DESC);
          }
        },
        {
          title: i18nService.getSafeText('sort.remove'),
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.unsortColumn();
          },
          shown: function() {
            return service.sortable( $scope ) && 
                   typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && 
                   typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null &&
                  !service.suppressRemoveSort( $scope );
          }
        },
        {
          title: i18nService.getSafeText('column.hide'),
          icon: 'ui-grid-icon-cancel',
          shown: function() {
            return service.hideable( $scope );
          },
          action: function ($event) {
            $event.stopPropagation();
            $scope.hideColumn();
          }
        }
      ];
    },
    

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name getColumnElementPosition
     * @description  gets the position information needed to place the column
     * menu below the column header
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {GridCol} column the column we want to position below
     * @param {element} $columnElement the column element we want to position below
     * @returns {hash} containing left, top, offset, height, width
     * 
     */  
    getColumnElementPosition: function( $scope, column, $columnElement ){
      var positionData = {};
      positionData.left = $columnElement[0].offsetLeft;
      positionData.top = $columnElement[0].offsetTop;

      // Get the grid scrollLeft
      positionData.offset = 0;
      if (column.grid.options.offsetLeft) {
        positionData.offset = column.grid.options.offsetLeft;
      }

      positionData.height = gridUtil.elementHeight($columnElement, true);
      positionData.width = gridUtil.elementWidth($columnElement, true);
      
      return positionData;
    },
    

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name repositionMenu
     * @description  Reposition the menu below the new column.  If the menu has no child nodes 
     * (i.e. it's not currently visible) then we guess it's width at 100, we'll be called again
     * later to fix it
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {GridCol} column the column we want to position below
     * @param {hash} positionData a hash containing left, top, offset, height, width
     * @param {element} $elm the column menu element that we want to reposition
     * @param {element} $columnElement the column element that we want to reposition underneath
     * 
     */  
    repositionMenu: function( $scope, column, positionData, $elm, $columnElement ) {
      var menu = $elm[0].querySelectorAll('.ui-grid-menu');
      var containerId = column.renderContainer ? column.renderContainer : 'body';
      var renderContainer = column.grid.renderContainers[containerId];

      // It's possible that the render container of the column we're attaching to is 
      // offset from the grid (i.e. pinned containers), we need to get the difference in the offsetLeft 
      // between the render container and the grid
      var renderContainerElm = gridUtil.closestElm($columnElement, '.ui-grid-render-container');
      var renderContainerOffset = renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left;

      var containerScrolLeft = renderContainerElm.querySelectorAll('.ui-grid-viewport')[0].scrollLeft;

      // default value the last width for _this_ column, otherwise last width for _any_ column, otherwise default to 170
      var myWidth = $scope.col.lastMenuWidth ? $scope.col.lastMenuWidth : ( $scope.lastMenuWidth ? $scope.lastMenuWidth : 170);
      var paddingRight = $scope.col.lastMenuPaddingRight ? $scope.col.lastMenuPaddingRight : ( $scope.lastMenuPaddingRight ? $scope.lastMenuPaddingRight : 10);
      if (menu.length !== 0){
        myWidth = gridUtil.elementWidth(menu, true);
        $scope.lastMenuWidth = myWidth;
        $scope.col.lastMenuWidth = myWidth;

        // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
        // Get the column menu right padding
        paddingRight = parseInt(gridUtil.getStyles(angular.element(menu)[0])['paddingRight'], 10);
        $scope.lastMenuPaddingRight = paddingRight;
        $scope.col.lastMenuPaddingRight = paddingRight;
      }

      $elm.css('left', (positionData.left + renderContainerOffset - containerScrolLeft + positionData.width - myWidth + paddingRight) + 'px');
      $elm.css('top', (positionData.top + positionData.height) + 'px');
    }    

  };
  
  return service;
}])


.directive('uiGridColumnMenu', ['$log', '$timeout', 'gridUtil', 'uiGridConstants', 'uiGridColumnMenuService', 
function ($log, $timeout, gridUtil, uiGridConstants, uiGridColumnMenuService) {
/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridColumnMenu
 * @description  Provides the column menu framework, leverages uiGridMenu underneath
 * 
 */

  var uiGridColumnMenu = {
    priority: 0,
    scope: true,
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridColumnMenu',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      var self = this;
      
      uiGridColumnMenuService.initialize( $scope, uiGridCtrl );

      $scope.defaultMenuItems = uiGridColumnMenuService.getDefaultMenuItems( $scope );

      // Set the menu items for use with the column menu. The user can later add additional items via the watch
      $scope.menuItems = $scope.defaultMenuItems;
      uiGridColumnMenuService.setColMenuItemWatch( $scope );

  
      /**
       * @ngdoc method
       * @methodOf ui.grid.directive:uiGridColumnMenu
       * @name showMenu
       * @description Shows the column menu.  If the menu is already displayed it
       * calls the menu to ask it to hide (it will animate), then it repositions the menu
       * to the right place whilst hidden (it will make an assumption on menu width), 
       * then it asks the menu to show (it will animate), then it repositions the menu again 
       * once we can calculate it's size.
       * @param {GridCol} column the column we want to position below
       * @param {element} $columnElement the column element we want to position below
       */
      $scope.showMenu = function(column, $columnElement) {
        // Swap to this column
        $scope.col = column;

        // Remove an existing document click handler
//        $document.off('click', documentClick);

        // Get the position information for the column element
        var colElementPosition = uiGridColumnMenuService.getColumnElementPosition( $scope, column, $columnElement );

        var repositionMenuClosure = function( $scope, column, colElementPosition, $elm, $columnElement ) {
          return function() {
            uiGridColumnMenuService.repositionMenu( $scope, column, colElementPosition, $elm, $columnElement );
          };
        };
        
        if ($scope.menuShown) {
          $scope.$broadcast('hide-menu');
          
          uiGridColumnMenuService.repositionMenu( $scope, column, colElementPosition, $elm, $columnElement );
          $scope.$broadcast('show-menu');
          $timeout( repositionMenuClosure( $scope, column, colElementPosition, $elm, $columnElement ));
        } else {
          self.shown = $scope.menuShown = true;
          uiGridColumnMenuService.repositionMenu( $scope, column, colElementPosition, $elm, $columnElement );
          $scope.$broadcast('show-menu');
          $timeout( repositionMenuClosure( $scope, column, colElementPosition, $elm, $columnElement ));
        }

        // Hide the menu on a click on the document
//        $document.on('click', documentClick);
      };


      /**
       * @ngdoc method
       * @methodOf ui.grid.directive:uiGridColumnMenu
       * @name hideMenu
       * @description Hides the column menu.
       * @param {boolean} broadcastTrigger true if we were triggered by a broadcast
       * from the menu itself - in which case don't broadcast again as we'll get
       * an infinite loop
       */
      $scope.hideMenu = function( broadcastTrigger ) {
        delete $scope.col;
        $scope.menuShown = false;
        
        if ( !broadcastTrigger ){
          $scope.$broadcast('hide-menu');
        }
      };

/*
      function documentClick() {
        $scope.$apply($scope.hideMenu);
        $document.off('click', documentClick);
      }
      
      function resizeHandler() {
        $scope.$apply($scope.hideMenu);
      }
      angular.element($window).bind('resize', resizeHandler);

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
        $scope.hideMenu();
      }));

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, function(evt, args) {
        $scope.hideMenu();
      }));

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', resizeHandler);
        $document.off('click', documentClick);
      });
*/      
      $scope.$on('menu-hidden', function() {
        $scope.hideMenu( true );
      });

 
      /* Column methods */
      $scope.sortColumn = function (event, dir) {
        event.stopPropagation();

        $scope.grid.sortColumn($scope.col, dir, true)
          .then(function () {
            $scope.grid.refresh();
            $scope.hideMenu();
          });
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        $scope.grid.refresh();
        $scope.hideMenu();
      };

      $scope.hideColumn = function () {
        $scope.col.colDef.visible = false;

        $scope.grid.refresh();
        $scope.hideMenu();
      };
    },
    
    
    
    controller: ['$scope', function ($scope) {
      var self = this;
      
      $scope.$watch('menuItems', function (n, o) {
        self.menuItems = n;
      });
    }]
  };

  return uiGridColumnMenu;

}]);

})();