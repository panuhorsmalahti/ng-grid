describe('uiGridHeaderCell', function () {
  var grid, $scope, $compile, $document, $timeout, $window, recompile;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];
  
  var columnDefs = [
    { name: 'name'},
    { name: 'gender' },
    { name: 'company' }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$document_, _$timeout_, _$window_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $document = _$document_;
    $timeout = _$timeout_;
    $window = _$window_;

    $scope.gridOpts = {
      enableSorting: true,
      columnDefs: columnDefs,
      data: data
    };

    recompile = function () {
      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
      
      $compile(grid)($scope);
      $document[0].body.appendChild(grid[0]);

      $scope.$digest();
    };

    recompile();
  }));

  afterEach(function() {
    grid.remove();
  });

  describe('column menu', function (){ 
    var headerCell1,
        headerCell2,
        menu;

    beforeEach(function () {
      headerCell1 = $(grid).find('.ui-grid-header-cell:nth(0) .ui-grid-cell-contents');
      headerCell2 = $(grid).find('.ui-grid-header-cell:nth(1) .ui-grid-cell-contents');
      
      menu = $(grid).find('.ui-grid-column-menu');
    });

    function openMenu() {
      headerCell1.trigger('mousedown');
      $scope.$digest();
      $timeout.flush();
      $scope.$digest();
    }

    describe('showing a menu with long-click', function () {
      it('should open the menu', inject(function () {
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible (the inner is present)');
      }));
    });

    describe('right click', function () {
      it('should do nothing', inject(function() {
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not initially visible');

        headerCell1.trigger({ type: 'mousedown', button: 3 });
        $scope.$digest();
        $timeout.flush();
        $scope.$digest();

        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      }));
    });

    describe('clicking outside visible menu', function () {
      it('should close the menu', inject(function() {
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible');

        $document.trigger('click');
        $scope.$digest();
        
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      }));
    });

    describe('with enableColumnMenu off', function() {
      it('should not be present', function () {
        $scope.gridOpts.enableColumnMenu = false;
        recompile();

        menu = $(grid).find('.ui-grid-column-menu .ui-grid-menu-inner');

        expect(menu[0]).toBeUndefined('menu is undefined');
        
        var headers = $(grid).find('.ui-grid-column-menu-button');
        expect(headers.length).toEqual(0);
      });
    });

    describe('with colDef.disableColumnMenu on', function() {
      it('should not be present', function () {
        $scope.gridOpts.columnDefs[0].disableColumnMenu = true;
        recompile();

        var headers = $(grid).find('.ui-grid-column-menu-button');
        expect(headers.length).toEqual(2);
      });
    });

    describe('when window is resized', function () {
      it('should hide an open menu', function () {
        delete $scope.gridOpts.columnDefs[0].disableColumnMenu;
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible');
        
        $(window).trigger('resize');
        $scope.$digest();

        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      });
    });

    // TODO(c0bra): Allow extra items to be added to a column menu through columnDefs
  });

});