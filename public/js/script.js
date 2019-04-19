Sugar.extend();

//+----------------------------------------------------------------------------+
//|                                                                            |
//+                                  Filters                                   +
//|                                                                            |
//+----------------------------------------------------------------------------+

(function(){

    var getUserFilters = function(){
        // There should be a call to the server.
        // Parsed result of the call follows below.
        var filters = [{
            name: "Подключенный спискок",
            img : "/img/eye.svg",
            category: [
                {
                    name: "МГТУ им Н.Э. Баумана",
                    position: [{
                        name: "ИУ9-43Б",
                        type: "matchCourseID",
                        courseID: 0
                    }, {
                        name: "Технопарк Python-14",
                        type: "matchCourseID",
                        courseID: 1
                    }]
                },{
                    name: "Digital Conference",
                    position: [{
                        name: "NLP/Machine Learning",
                        type: "matchCourseID",
                        courseID: 2
                    }]
                }
            ]
        }];
        return new Promise(function(resolve, reject){
            resolve(filters);
        });
    };

    var Filters = [];

    var filterViews = {
        "checkbox": Handlebars.compile($("#filter-checkbox-tmpl").html())
    }

    var positionTypes = {
        "matchCourseID": function(filter){
            var id = filter.courseID;
            filter.checked = true;
            var view = $(filterViews.checkbox(filter));
            var checkbox = view.find("input");

            var f = {};

            f.match = function(e){
                if (!checkbox.is(':checked'))
                    return false;
                return e.courseID === id;
            }

            return {view: view, filter: f};
        }
    };

    var filterTempl = Handlebars.compile($("#filter-parameter-tmpl").html());
    var categoryTempl = Handlebars.compile($("#filter-category-tmpl").html());
    var positionID = 0; // global counter

    var filtersView = function(filters){
        var target = $('.filter-sidebar');
        filters.forEach(function(filter){
            var filterNode = $(filterTempl(filter));

            filter.category.forEach(function(c){

                var category = $(categoryTempl(c));
                var posList = category.find('.category-positions-list');

                c.position.forEach(function(p){
                    if (positionTypes.hasOwnProperty(p.type)) {
                        p.id = positionID++;
                        var position = positionTypes[p.type](p);
                        posList.append(position.view);
                        Filters.push(position.filter);
                    } else {
                        console.warn("Unknown filter position type: "+p.type);
                    }
                });

                filterNode.append(category);
            });

            target.append(filterNode);
        });
    };

    getUserFilters().then(filtersView);

    window.Filters = Filters;
})();

//+----------------------------------------------------------------------------+
//|                                                                            |
//+                             Timetabale events                              +
//|                                                                            |
//+----------------------------------------------------------------------------+

(function(){

    var getUserTimetable = function(dates){
        // dates - array of Date()

        // There should be a call to the server.
        // Callback shuold get this array:
        /*

        var result = [{
            date: Date(),
            events: [{
                name: "",
                courseID: 10,
                url: "/url/to/lecture/page",
                timeStart: Date(),
                timeFinish: Date(),
                lecturer: "",
                place: "",
                info: "",
                hasDocument: false,
                hasFile: false,
                isOnline: false
            }, ...]
        }, ...]

        */
        /* generate some data to output */
        return new Promise(function(resolve, reject){
            var eventNames = [
                "Обыкновенные дифференциальные уравнения",
                "Операционные системы",
                "Алгоритмы компьютерной графики",
                "Дискретная математика",
                "Теория вероятностей",
                "Физика",
                "Программирование",
                "Базы данных",
                "Философия"
            ];
            var eventTimeStarts = [
                "8:30","10:15","11:50",
                "13:35", "15:20", "17:05",
                "18:50", "21:00"];

            var lecturers = [
                "Аксёнов М.С.",
                "Лазарев Д.Г.",
                "Хохлов Р.А.",
                "Бобров Г.А.",
                "Новиков Ф.В."
            ];

            var places = [
                "СК\"Олимпийский\"",
                "УЛК МГТУ им Баумана",
                "ГК МГТУ им Баумана"];

            var infos = ["",
                "Специальное машиностроение",
                "Динамическое программирование",
                "Линейные уравнения",
                "Кривые второго порядка",
                "Симплекс-метод",
                "Философия Ницше",
                "Изучение движения молекул сахара в крепких растворах турецкого чая"
            ];

            var getRndIndx = function(arr){
                return Math.floor(Math.random() * arr.length);
            };

            function gaussianRand() {
              var rand = 0;

              for (var i = 0; i < 6; i += 1) {
                rand += Math.random();
              }

              return rand / 6;
            }

            result = dates.map(function(date){
                var day = {};
                day.date = date;
                day.events = [];
                var suturdayK = date.isSaturday() ? Math.random()*0.75 : 1;
                var sundayK = date.isSunday() ? Math.random()*0.5 : 1;
                var countEvents = Math.floor(suturdayK*sundayK*gaussianRand() * (eventTimeStarts.length+1));
                var eventTimes = []
                while(eventTimes.length < countEvents) {
                    var i = getRndIndx(eventTimeStarts);
                    if(eventTimes.indexOf(i) === -1)
                        eventTimes.push(i);
                }

                eventTimes = eventTimes.sort(function(a,b){return a - b})
                for(var i = 0; i < eventTimes.length; i++){
                    var event = {};
                    event.name = eventNames[getRndIndx(eventNames)];
                    event.courseID = event.name.match(/[пП]/) ? 1 : 0;
                    event.url = "#";
                    var d = new Date(date);

                    var time = eventTimeStarts[eventTimes[i]]
                        .split(":")
                        .map(function(x){return parseInt(x)});

                    d.setHours(time[0], time[1]);
                    event.timeStart = d;
                    event.timeFinish = new Date(d - (-90*60*1000)); //JS MAGIC
                    event.lecturer = lecturers[getRndIndx(lecturers)];
                    event.place = places[getRndIndx(places)];
                    event.info = infos[getRndIndx(infos)];
                    event.hasDocument = Math.random() < 0.5;
                    event.hasFile = Math.random() < 0.5;
                    event.isOnline = event.timeStart <= Date.now()
                        && Date.now() <= event.timeFinish;

                    day.events.push(event);

                }
                return day;
            });

            resolve(result);
        })
    };

    var dayTmpl = Handlebars.compile($("#day-tmpl").html());
    var eventTmpl = Handlebars.compile($("#event-tmpl").html());
    var Events = [];

    var daysView = function(days){
        var target = $(".week-list-scroll")
        Events = [];
        for(var i = 0; i < days.length; i++){
            var day = days[i];
            day.name = day.date.format("{Weekday}", "ru").capitalize();
            day.today = day.date.isToday();
            day.date = day.date.format("%d.%m");
            var node = $(dayTmpl(day));
            var eventList = node.find(".day-card");

            day.events.forEach(function(e){
                var mx_len = 22 + (e.hasFile ? 0:4) + (e.hasDocument ? 0:4);
                e.placeShort = e.place.length > mx_len ? e.place.first(mx_len) + '...' : e.place;
                e.infoShort = e.info.length > mx_len ? e.info.first(mx_len) + '...' : e.info;
                e.timestart = e.timeStart.format("%R");
                e.timefinish = e.timeFinish.format("%R");
                if (e.timeStart <= Date.now()) {
                    if (Date.now() <= e.timeFinish) {
                        e.isCurrent = true
                    }
                } else {
                    e.isUpcoming = true;
                }
                e.viewNode = $(eventTmpl(e));
                eventList.append(e.viewNode);

                Events.push(e);
            });
            target.append(node)
        }

    };

    var reloadTimetable = function(dateStart){
        return new Promise(function(resolve, reject){
            var dates = [];
            var d = dateStart || new Date().beginningOfWeek().addDays(1);

            for(var i = 0; i < 7; i++){
                dates.push(new Date(d).addDays(i));
            }
            $(".day-place").remove();

            getUserTimetable(dates)
                .then(function(days){
                    daysView(days);
                    resolve();
                });
        })
    };

    var filterTimetable = function(filters){
        return new Promise(function(resolve, reject){
            Events.forEach(function(e){
                var show = false;
                filters.forEach(function(f){
                    show = show || f.match(e);
                });

                if (show) {
                    e.viewNode.show();
                } else {
                    e.viewNode.hide();
                }
            });
            resolve();
        })
    };

    window.reloadTimetable = reloadTimetable;
    window.filterTimetable = filterTimetable;

    reloadTimetable().then(function(){
        $(".week-list-scroll").scrollTo($(".day-place.current"),0, {axis:"x"});
    });

})();
//+----------------------------------------------------------------------------+
//|                                                                            |
//+                                UI listeners                                +
//|                                                                            |
//+----------------------------------------------------------------------------+
$(document).on('click', ".category-header", function(){
    if ($(this).is('.show')) {
        $(this).removeClass("show");
        $(this).parent().find(".collapse").hide(350);
    } else {
        $(this).addClass("show");
        var collapseItem = $(this).parent().find(".collapse");
        collapseItem.show(350);
    }
});

$(document).on("change", ".filter-sidebar input", function(){
    window.filterTimetable(window.Filters);
});

$(".toggle-filters-menu-btn").on("click", function(){
    if ($(this).is('.show')) {
        $(this).removeClass("show");
        $(".filter-sidebar").addClass('hidden');
        $(".filter-parameter").css("display", 'none');
    } else {
        $(this).addClass("show");
        $(".filter-sidebar").removeClass('hidden');
        $(".filter-parameter").css("display", 'none');
    }
});
$(".filter-sidebar").on('transitionend', function(){
    if (!$(this).is('.hidden')){
        $(".filter-parameter").css("display", 'block');
    }
});

(function(){
    var viewingWeek = new Date();
    viewingWeek = viewingWeek.beginningOfWeek().addDays(1);

    var labelWeek = $('.week-switch label');

    var viewWeek = function(w){
        var lastDayOfWeek = new Date(w).addDays(6);
        if (lastDayOfWeek.getMonth() == w.getMonth()){
            labelWeek.text(
                w.format("{d}")
                + ' - '
                + lastDayOfWeek.format("{d} %B",'ru')
            );
        } else {
            labelWeek.text(
                w.format("{d} %B",'ru')
                + ' - '
                + lastDayOfWeek.format("{d} %B",'ru')
            );
        }
        lastDayOfWeek.addDays(1);
        if (new Date().isBetween(w, lastDayOfWeek)){
            $(".week-switch").addClass('current-week');
        } else {
            $(".week-switch").removeClass('current-week');
        }
    };

    viewWeek(viewingWeek);

    $(".prev-week-btn").on("click", function(){
        viewingWeek = viewingWeek.addDays(-7);
        viewWeek(viewingWeek);
        window.reloadTimetable(viewingWeek)
            .then(function(){
                return window.filterTimetable(window.Filters)
            });
        ;
    });

    $(".next-week-btn").on("click", function(){
        viewingWeek = viewingWeek.addDays(7);
        viewWeek(viewingWeek);
        window.reloadTimetable(viewingWeek)
            .then(function(){
                return window.filterTimetable(window.Filters)
            })
    });

    $('.to-today-btn').on('click', function(){
        viewingWeek = new Date();
        viewingWeek = viewingWeek.beginningOfWeek().addDays(1);
        viewWeek(viewingWeek);
        window.reloadTimetable(viewingWeek)
            .then(function(){
                return window.filterTimetable(window.Filters)
            })
            .then(function(){
                $(".week-list-scroll").scrollTo($(".day-place.current"), 1000, {axis:"x"});
        });
    });

})();
