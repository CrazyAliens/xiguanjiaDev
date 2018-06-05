//Date格式化方法
Date.prototype.Format = function(fmt){   //格式化时间
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  :Math.floor(this.getMilliseconds()/100)            //毫秒
    };
    if(/(y+)/.test(fmt))//正则 格式化年份
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))//正则 格式化 时分秒
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}
//初始化时间戳
function  initDate(date) {
    var day= new Date(),
        init = new Date(date),
        time=init.getTime()-day.getTime();//时间对象换成毫秒差的时间差
    return parseInt(time+new Date(day.getFullYear(),day.getMonth(),day.getDate()).getTime());
}
//秒杀倒计时
function daojishi( day,el) {//倒计时 ,day是时间的字符串，el是jquery节点
    var time = initDate(day);
    var timer1 = setInterval(function () {
        time-=100;//时间递减0.1s/100ms
        var date = new Date();
        date.setTime(time);
        var formatDate=date.Format("mm:ss:S"),
            cday=(new Date(day).getDate()-new Date().getDate())*24+date.getHours();//相差天数换成小时
        cday=cday<=0?"":cday+":";
        el.html(cday+formatDate);
    },100)
}

//获取商品信息
function getGoogsData(url) {
    var goods;
    // var aaa = '{"Result":{"StoreStatus":5,"StoreStatusText":"正常","ProductId":1423,"ImageUrl":"http://www.e88u.com/Storage/master/product/thumbs160/160_201805282036025867220.jpg","Stock":1798,"ActivityUrl":"","FightGroupActivityId":0,"SkuItems":[{"AttributeId":"70","AttributeName":"检测/治理","AttributeValue":[{"ValueId":"429","Value":"CMA检测（1个点）","UseAttributeImage":"False","ImageUrl":""},{"ValueId":"307","Value":"治理（1平米）","UseAttributeImage":"False","ImageUrl":""}]}],"skus":[{"SkuId":"1423_0","SKU":"SP0112100137","Weight":0.0000,"Stock":1798,"StoreStock":2000,"SalePrice":7.80,"StoreSalePrice":0.0,"ImageUrl":""},{\n' +
    //     '      "SkuId":"1186_429",\n' +
    //     '      "SKU":"JZR03",\n' +
    //     '      "Weight":0.0000,\n' +
    //     '      "Stock":200,\n' +
    //     '      "StoreStock":200,\n' +
    //     '      "SalePrice":300.00,\n' +
    //     '      "StoreSalePrice":0.0,\n' +
    //     '      "ImageUrl":""\n' +
    //     '    }],"DefaultSku":{"SkuId":"1423_0","SKU":"SP0112100137","Weight":0.0000,"Stock":1798,"StoreStock":2000,"SalePrice":7.80,"StoreSalePrice":0.0,"ImageUrl":""}}}';
    // goods = JSON.parse(aaa);
    //alert(goods.Result.SkuItems[0].AttributeId);
    // return goods.Result;
    $.ajax({
        url:url,
        async:false,
        success:function (res) {
            goods= res.Result;
        }
    });
    return goods;
}
//弹出规格窗口
function skuItemsList(el,data) {
    var items=el.parent().parent().find("div.goods-size");
    if (items.length>0){//判断规格窗口是否存在
        items.show();
        items.children().show();
    }
    else {
        //c创建节点
        var  items=$("<div class='goods-size'></div>");
        // infoTop=$("<div class='goodsinfo-top'><i class='iconfont .icon-guanbi'></i></div>")
        // imgTop=$("<img class='goods-img'>").attr('src',data.ImageUrl),
        // priceTop=$("<span class='goods-price'></span>").text("￥"+data.DefaultSku.SalePrice)
        // infoTop.on("click",function () {
        //     items.hide()
        // })
        // imgTop.appendTo(infoTop)//挂载图片节点
        // priceTop.appendTo(infoTop)//挂载价格节点
        //     infoTop.appendTo(items)//挂载到主节点

        $.each(data.SkuItems[0].AttributeValue,function (key,val) {
            console.log(key)
            console.log(data.skus)
            var infoBottom=$("<div class='goodsinfo-bottom'></div>");
            $("<span class='g-name'></span>")//创建规格的名字节点
                .text(val.Value)//设置规格的名字节点
                .appendTo(infoBottom);//挂载规格的名字节点

            $("<span class='g-price' style='color:#ff5722;'></span>")//创建规格的价格节点
                .text("￥"+data.skus[key].SalePrice)
                .appendTo(infoBottom);

            $(" <div class='goods-tool'><i class='iconfont icon-jian-copy'></i><span class='car-num'></span><i class='iconfont icon-jia'></i>\</div>")//创建右边工具栏节点
                .attr("productid",data.ProductId,"ValueId",val.ValueId)
                .appendTo(infoBottom)

            infoBottom.appendTo(items)//挂载到主节点
        })

        items.appendTo(el.parent().parent())//挂载到商品规格的根节点

        var addBtn = $(".goods-tool").find(".icon-jia"),
            subBtn =$(".goods-tool").find(".icon-jian-copy");

        //规格的+按钮事件
        addBtn.on("click",function () {
            var num=getNum($(this));

            $(this).siblings(".icon-jian-copy").show();

            //查询商品信息
            num.math(2)//数量+1

            shopCarTotal(el.find(".car-num"),items.find(".goods-tool"))//计算该商品总数

            shopCarTotal($("#circle"),$(".item-tool"))//计算购物车的总数
        })

        //规格的-按钮事件
        subBtn.on("click",function () {
            var num=getNum($(this)),
                goodstype=0;

            num.math(1)//数量-1

            if(num.count<=0){
                num.num.text(0);
                $(this).hide();
            }

            $(this).parent().parent().parent().find(".goodsinfo-bottom")
                .each(function () {
                    parseInt($(this).find(".car-num").text())>0?goodstype++:true;
                })

            if(goodstype<=0){
                 $(this).hide()
                $(this).parent().parent().parent().hide();
                el.show()
            }

            shopCarTotal(el.find(".car-num"),items.find(".goods-tool"))//计算该商品总数

            shopCarTotal($("#circle"),$(".item-tool"))//计算购物车的总数
        })
    }

}
//购物车计数
function shopCarTotal(totalEl,itemEl) {
    var shopcarCount = totalEl,
        spanCount = itemEl.find(".car-num"),
        count=0,
        arr=[];//返回产品信息,用于更新购物车数据
    spanCount.each(function () {
        var n =parseInt( $(this).text());
        count+=isNaN(n)?0:n;
        arr.push({
            "ProductId":$(this).find(".icon-jian-copy").attr("ProductId"),
            "num":n
        })
    })
    shopcarCount.text(count)
    return arr
}
//获取数量
function getNum(el){//el为当前点击的按钮的jquery节点
    var num=el.siblings(".car-num"),
        count = parseInt(num.text());
    count=isNaN(count)?0:count;
    return {
        num:num,//+和—按键之间的span的jquery节点
        count:count,//计数
        //自增自减的函数
        math:function(flag) {//flag：1自减  ， 2 自增
            switch (flag){
                case 1:
                    this.num.text(--this.count)
                    break;
                case 2:
                    this.num.text(++this.count)
                    break;
            }
        }
    }
}
//加入购物车
function AddShoppingCar() {
    var toolBar = $(".item-tool"),
        addBtn = toolBar.find(".icon-jia"),
        subBtn = toolBar.find(".icon-jian-copy");

    addBtn.on("click",function () {
        var num=getNum($(this))
        $(this).siblings(".icon-jian-copy").show();
        //查询商品信息
        var goods =getGoogsData("./mock/test.json")
        console.log(goods)
        if(goods.SkuItems.length>0 ){//判断商品规格数量大于0弹出规格
            $(this).parent().hide()
            skuItemsList($(this).parent(),goods)
        }
        num.math(2)//数量+1
        shopCarTotal($("#circle"),$(".item-tool"))//计算购物车的总数
        // AddToCart(this);
    })
    subBtn.on("click",function () {
        var num=getNum($(this));
        if(false){//判断商品规格
            $(this).parent().hide()

            skuItemsList($(this).parent(),goods)//弹出规格窗口
        }
        num.math(1)//数量-1
        if(num.count<=0){
            num.num.text("");
            $(this).hide()
        }
        shopCarTotal($("#circle"),$(".item-tool"))//计算购物车的总数

    })
}

//加载swiper插件
+(function () {
    var SwiperSm = new Swiper ('#swiper-sm', {direction: 'vertical',});
    setInterval(function (){SwiperSm.isEnd ?SwiperSm.slideTo(0):SwiperSm.slideNext()},1600)

    var Swiper2 = new Swiper ('#swiper2', {
        dirction:"horizontal",
        loop: true,
        freeMode:true,
    });

    var SwiperNav = new Swiper ('#swiper-nav', {
        dirction:"horizontal",
        slidesPerView :'auto',
        freeMode:true,
    });
})()
//吸顶效果
+(function () {
    var
        // search = $('.s_1'),
        navL=$('#swiper-nav .swiper-wrapper'),
        navProp=$('.category1'),
        productList=$('#category2'),
        Soffset =navProp.offset();//返回或设置导航栏相对于文档的偏移(位置)

    //加个屏幕滚动事件，c是滚动条相当于文档最顶端的距离
    $(document).on('scroll',function(){
        var DscrollTop = $(document).scrollTop();
        // console.log("Soffset----",Soffset.top);
        // console.log("c----",DscrollTop);
        // 当滚动的屏幕距离大于等于导航栏本身离最顶端的距离时（判断条件）给它加样式
        if(Soffset.top<DscrollTop){
            // search.css({'position':'fixed','top':'0'});
            navL.css({'position':'fixed','top':'1.6rem'});
            navProp.css({'position':'fixed','top':'1.6rem'});
            // navProp.width(productList.width())
            // search.width(productList.width());//重新计算搜索栏宽度
        }else{
            // search.css({'position':'absolute','top':'0'});
            navL.css({'position':'absolute','top':'0'});
            navProp.css({'position':'absolute','top':'0'});
            // navProp.css({'position':'absolute','top':'1.8rem'});
            // navL.width( navProp.width());
            // search.width(productList.width());//重新计算搜索栏宽度
        }
    })
})();
//加载秒杀倒计时
+(function (){
    var list=$(".shop-miaosha").each(function () {daojishi('2018-06-05 20:30:00', $(this));});
})();
//切换门店
+(function (){
    var castbtn= $(".cast"),
        castlist =$(".castlist");

    castbtn.click(function () {
    if(castbtn.attr("data")=="close"){
        castlist.show();
        castbtn.attr("data","open");
        }
    else if(castbtn.attr("data")=="open"){
        castlist.hide();
        castbtn.attr("data","close");
        }
    });

    castlist.click(function (e){
        var listItem = e.target//门店地址列表的li
    })
})();

//搜索栏聚焦、失去焦点事件
$("#txtKeywords").focus(function () {
    $("#search").hide();
})
$("#txtKeywords").blur(function () {
    if ($("#txtKeywords").val() == "") {
        $("#search").show();
    }
})
//搜索栏侧边导航栏点击事件
$("#swiper-nav .swiper-slide").on("click",function(e) {
    // 更改样式
    $("#swiper-nav .swiper-slide li").removeClass("cur")
    $(e.target).addClass("cur");
    //点击请求数据
    $(document).scrollTop($(".category-box").offset().top)
    InitialData()
})

//滚动加载更多
function loadMore(){
    var DscrollTop = $(document).scrollTop(),
        docH =$(document).height(),
        winH=$(window).height();
    if((DscrollTop+winH)>=docH){
        setTimeout(function () {
            InitialData()
        },800)
    }
}
//监听窗口滚动事件
$(window).on('scroll',loadMore);

var pageindex = 1;//页码
var pagesize = 10;//
var storeId = getParam("storeId");//门店ID
var html = '';

function InitialData() {

    pagesize = 1;
    var pid = $(".cur").attr('pid');
    var storeId = getParam("storeId");

    html += "<dl style=\"display: block;\">\n" +
        "                             <dd class=\"clearfix\">\n" +
        "                                 <a class=\"curl\" href=\"http://www.e88u.com/WapShop/StoreProductDetails.aspx?productId=1319&amp;storeId=801\">\n" +
        "                                     <img src=\"./img/yumi.jpg\" width=\"50\" height=\"50\" onerror=\"javascript: this.src = &#39;/utility/pics/none.gif&#39;\">\n" +
        "                                     <span>青椒+丝瓜组合（4斤）</span>\n" +
        "                                 </a>\n" +
        "                                 <span style=\"color:#ff5722;\">￥9.90\n" +
        "                                     <font>￥15.00</font>\n" +
        "                                    <div class=\"item-tool\">\n" +
        "                                        <i class=\"iconfont icon-jian-copy\"></i>\n" +
        "                                        <span class=\"car-num\"></span>\n" +
        "                                        <i class=\"iconfont icon-jia\" productid=\"1319\" ></i>\n" +
        "                                    </div>\n" +
        "                                </span>\n" +
        "\n" +
        "                             </dd>\n" +
        "                         </dl>\n" +
        "\n" +
        "                         <dl style=\"display: block;\">\n" +
        "                             <dd class=\"clearfix\">\n" +
        "                                 <a class=\"curl\" href=\"http://www.e88u.com/WapShop/StoreProductDetails.aspx?productId=1318&amp;storeId=801\">\n" +
        "                                     <img src=\"./img/chengzi.jpg\" width=\"50\" height=\"50\" onerror=\"javascript: this.src = &#39;/utility/pics/none.gif&#39;\">\n" +
        "                                     <span>黄瓜+西红柿组合（4斤）</span>\n" +
        "                                 </a>\n" +
        "                                 <span style=\"color:#ff5722;\">￥9.90\n" +
        "\n" +
        "                            <font>￥15.00</font>\n" +
        "                                <div class=\"item-tool\">\n" +
        "                                        <i class=\"iconfont icon-jian-copy\"></i>\n" +
        "                                        <span class=\"car-num\"></span>\n" +
        "                                        <i class=\"iconfont icon-jia\" productid=\"1318\" ></i>\n" +
        "                                    </div>\n" +
        "\n" +
        "                             </dd>\n" +
        "                         </dl>\n" +
        "\n" +
        "                         <dl style=\"display: block;\">\n" +
        "                             <dd class=\"clearfix\">\n" +
        "                                 <a class=\"curl\" href=\"http://www.e88u.com/WapShop/StoreProductDetails.aspx?productId=1317&amp;storeId=801\">\n" +
        "                                     <img src=\"./img/shanzhu.jpg\" width=\"50\" height=\"50\" onerror=\"javascript: this.src = &#39;/utility/pics/none.gif&#39;\">\n" +
        "                                     <span>七星瓢虫电热蚊香液1盒</span>\n" +
        "                                 </a>\n" +
        "                                 <span style=\"color:#ff5722;\">￥19.90\n" +
        "                                     <font>￥45.00</font>\n" +
        "                                    <div class=\"item-tool\">\n" +
        "                                        <i class=\"iconfont icon-jian-copy\"></i>\n" +
        "                                        <span class=\"car-num\"></span>\n" +
        "                                        <i class=\"iconfont icon-jia\" productid=\"1317\" ></i>\n" +
        "                                    </div>\n" +
        "                             </dd>\n" +
        "                         </dl>\n" +
        "\n" +
        "                         <dl style=\"display: block;\">\n" +
        "                             <dd class=\"clearfix\">\n" +
        "                                 <a class=\"curl\" href=\"http://www.e88u.com/WapShop/StoreProductDetails.aspx?productId=1316&amp;storeId=801\">\n" +
        "                                     <img src=\"./img/hongshuye.jpg\" width=\"50\" height=\"50\" onerror=\"javascript: this.src = &#39;/utility/pics/none.gif&#39;\">\n" +
        "                                     <span>飞科博锐三头浮动电动剃须刀</span>\n" +
        "                                 </a>\n" +
        "                                 <span style=\"color:#ff5722;\">￥39.90\n" +
        "                                 <font>￥99.00</font>\n" +
        "                                    <div class=\"item-tool\">\n" +
        "                                        <i class=\"iconfont icon-jian-copy\"></i>\n" +
        "                                        <span class=\"car-num\"></span>\n" +
        "                                        <i class=\"iconfont icon-jia\" productid=\"1316\" ></i>\n" +
        "                                    </div>\n" +
        "                                 </span>\n" +
        "\n" +
        "                             </dd>\n" +
        "                         </dl>\n" +
        "\n" +
        "                         <dl style=\"display: block;\">\n" +
        "                             <dd class=\"clearfix\">\n" +
        "                                 <a class=\"curl\" href=\"http://www.e88u.com/WapShop/StoreProductDetails.aspx?productId=1315&amp;storeId=801\">\n" +
        "                                     <img src=\"./img/niuyouguo.jpg\" width=\"50\" height=\"50\" onerror=\"javascript: this.src = &#39;/utility/pics/none.gif&#39;\">\n" +
        "                                     <span>韩式耐高温陶瓷锅1个</span>\n" +
        "                                 </a>\n" +
        "                                 <span style=\"color:#ff5722;\">￥65.00\n" +
        "\n" +
        "                            <font>￥128.00</font>\n" +
        "                                     <div class=\"item-tool\">\n" +
        "                                        <i class=\"iconfont icon-jian-copy\"></i>\n" +
        "                                        <span class=\"car-num\"></span>\n" +
        "                                        <i class=\"iconfont icon-jia\" productid=\"1315\" ></i>\n" +
        "                                    </div>\n" +
        "                             </dd>\n" +
        "                         </dl>";

    $('#category2').html(html);
    AddShoppingCar();
    shopCarTotal($("#circle"),$(".item-tool"))
    //$("#category2").show();
    //$("#emptypanel").hide();
}

function bindData1() {
    pagesize = pagesize + 10;
    var pid = $(".cur").attr('pid');
    var storeId = getParam("storeId");

    var html = '';
    html += 'aaaa';
    document.getElementById('category2').innerHTML = html;
    var RecordCount = resultData.Result.RecordCount;
    if (RecordCount <= pagesize) {
        $("#load").text("没有更多的商品了...")
    }
    else {
        $("#load").html("加载更多商品...");
        $("#load").click(function () {
            bindData1();
        })
    }
    $("#category2").show();
    $("#emptypanel").hide();
}

function bindData() {
    var storeId = getParam("storeId");
    $("#cUl li").click(function () {
        var array = new Array();
        $('.category1 li').each(function () {
            array.push($(this).position().top - 56);
        });
        var pid = $(this).attr('pid');
        var index = $(this).index();
        $('.category1').delay(200).animate({ scrollTop: array[index] }, 300);
        $(this).addClass('cur').siblings().removeClass();
        $('.category2').scrollTop(0);

        $.ajax({
            url: "/API/VshopProcess.ashx?action=getProducts",
            type: 'post',
            dataType: 'json',
            data: {
                "pageindex": 1,
                "pagesize": 10,
                "cid": pid,
                storeId: storeId
            },
            timeout: 10000,
            success: function (resultData) {
                if (resultData.Result.RecordCount > 0) {
                    var html = template('dlList', resultData);
                    document.getElementById('category2').innerHTML = html;
                    var RecordCount = resultData.Result.RecordCount;
                    //点击分类重置每页显示记录
                    pagesize = 10;
                    if (RecordCount <= pagesize) {
                        $("#load").text("没有更多的商品了...")
                    }
                    else {
                        $("#load").html("加载更多商品...");
                        $("#load").click(function () {
                            bindData1();
                        })
                    }

                    $("#category2").show();
                    $("#emptypanel").hide();
                }
                else {
                    document.getElementById('category2').innerHTML = "";
                    $("#category2").hide();
                    $("#emptypanel").show();
                }
            }
        });
    })
}

//监听按下enter键事件
$(document).on("keydown",function (event) {
    if (event.keyCode == 13) {
        if ($("#txtKeywords").val() == "") {
            $("#search").show();
        }
        searchs();
    }
});

function searchs() {
    var key = $("#txtKeywords").val();
    var str = window.location.search;
    var categoryId;
    categoryId = getParam("categoryId");
    var storeId = getParam("storeId");
    var url = "ProductList?storeId=" + storeId + "&keyWord=" + escape(key);
    window.location.href = url;
    console.log("搜索")
}

$(function () {
    //滚动
    $(".category1").niceScroll({ cursorwidth: 0, cursorborder: 0 });

    //图片延迟加载
    //$(".lazyload").scrollLoading({ container: $(".category2") });

    var a = $(".category-box").offset().top;
    $('.category-box').height($(window).height() - a);
});

$("#load").click(function () {
    bindData1();
})