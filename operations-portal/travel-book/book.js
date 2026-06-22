/* book.js — FIXED Travel Stars booklet filler.
   No resolver, no page builder, no snapshot. It maps trip data into a fixed
   sequence of fixed page templates: header pages, then one bundle per city
   (divider + its fixed sections), then footer pages. Images are direct URLs. */
(function () {
  "use strict";
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  var BRAND = null;
  function brandOf(d){
    var b=(d&&d.branding)||{};
    return {
      agency_en:(d&&d.agency_en)||b.agency_en||"",
      agency_ar:(d&&d.agency_ar)||b.agency_ar||"",
      logo_url:b.logo_url||"",
      logo_alt:b.logo_alt||(d&&d.agency_en)||b.agency_en||"",
      primary:b.primary_color||"", secondary:b.secondary_color||""
    };
  }
  function safeColor(c){ return /^#[0-9a-fA-F]{3,8}$/.test(c||"")?c:""; }
  function colorStyle(b){
    var p=safeColor(b.primary), s=safeColor(b.secondary);
    if(!p&&!s) return "";
    var r=":root{"; if(p) r+="--navy:"+p+";--navy2:"+p+";--navy-d:"+p+";"; if(s) r+="--gold:"+s+";"; r+="}";
    return "<style>"+r+"</style>";
  }
  function logo(){
    var b=BRAND||{};
    if(b.logo_url) return '<span class="logo logo-img"><img src="'+esc(b.logo_url)+'" alt="'+esc(b.logo_alt||"")+'"></span>';
    var ar=b.agency_ar||"", en=esc(b.agency_en||"").replace(/\s+/,"<br>");
    return '<span class="logo"><span class="l-ar">'+esc(ar)+'</span><span class="star">&#9733;</span><span class="l-en">'+en+'</span></span>';
  }
  function corners(){ return '<span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>'; }

  // direct image -> circle slot; empty/broken -> neutral placeholder (no resolver)
  function circleImg(url){
    if (url && String(url).trim())
      return '<div class="place-img"><img src="'+esc(url)+'" alt="" onerror="this.remove();this.parentNode.classList.add(\'miss\')"></div>';
    return '<div class="place-img miss"></div>';
  }
  function photo(url){
    if (url && String(url).trim())
      return '<div class="divider-photo"><img src="'+esc(url)+'" alt="" onerror="this.remove();this.parentNode.classList.add(\'miss\')"></div>';
    return '<div class="divider-photo miss"></div>';
  }

  function noteBlock(title, arr){
    var li=(arr||[]).map(function(t){ return '<div class="note-li"><span class="b"></span><span>'+esc(t)+'</span></div>'; }).join("");
    return '<p class="note-h">'+esc(title)+'</p>'+li;
  }

  // ---------- fixed page templates ----------
  function pageCover(d){
    return '<section class="page">'+corners()+
      '<div class="topband" dir="ltr"><span class="t-en">'+esc(d.country_en)+'</span><span class="t-ar">'+esc(d.country_ar)+'</span></div>'+
      '<div class="topband-logo"><div class="logo-circle">'+logo()+'</div></div>'+
      '<div class="cover-welcome"><p class="greet">شركة <span class="en">'+esc(BRAND.agency_en)+'</span> ترحب بالاستاذ/ة :</p>'+
      '<div class="name-box"><div class="inner">'+esc(d.traveler_name)+'</div></div></div></section>';
  }
  function hotelCard(h){
    function row(k,v,cls){ return '<div class="hrow'+(cls&&cls.hl?" hl":"")+'"><span class="hk">'+esc(k)+'</span><span class="hsep">:</span><span class="hv'+(cls&&cls.c?(" "+cls.c):"")+'">'+esc(v)+'</span></div>'; }
    return '<div class="hcard">'+
      '<div class="guest"><span class="k">GUEST NAME</span><span class="v">'+esc(h.guest_name)+'</span></div>'+
      '<div class="bd">Booking Details</div>'+
      row("Confirmation Number",h.confirmation_number,{c:"cn"})+
      '<div class="hrow hl"><span class="hk">Property Name</span><span class="hsep">:</span><span class="hv pn">'+esc(h.property_name)+'</span></div>'+
      '<div class="hrow hl"><span class="hk">Address</span><span class="hsep">:</span><span class="hv">'+esc(h.address)+'</span></div>'+
      row("Total Room",h.total_room)+row("Room Type",h.room_type)+row("Bed Type",h.bed_type)+
      row("Check In",h.check_in)+row("Check Out",h.check_out)+row("Total Nights",h.total_nights)+row("Meal Plan",h.meal_plan)+
      '<div class="div"></div></div>';
  }
  function pagesHotels(d){
    var cards=(d.hotels||[]).map(hotelCard), out=[];
    out.push('<section class="page"><div class="notebar">'+noteBlock("ملاحظة:",d.hotels_note)+'</div>'+
      '<div style="text-align:right"><span class="band-title">فوتشرات حجوزات الفنادق</span></div>'+
      '<div class="hotels">'+cards.slice(0,2).join("")+'</div></section>');
    for (var i=2;i<cards.length;i+=2)
      out.push('<section class="page"><div class="hotels" style="padding-top:20mm">'+cards.slice(i,i+2).join("")+'</div></section>');
    return out.join("");
  }
  function pageFlights(d){
    return '<section class="page">'+corners()+
      '<div class="notebar">'+noteBlock("ملاحظة:",d.flights_note)+'</div>'+
      '<div style="text-align:right"><span class="band-title">تذاكر الطيران الداخلي</span></div>'+
      '<div class="flight-mid">'+logo()+'</div></section>';
  }
  function pageItinerary(d){
    var rows=(d.itinerary||[]).map(function(r){
      return '<tr><td class="date">'+esc(r.date)+'</td><td class="prog">'+esc(r.program)+'</td><td class="city">'+esc(r.city)+'</td></tr>';
    }).join("");
    return '<section class="page"><div class="notebar">'+noteBlock("ملاحظة:",d.itinerary_note)+'</div>'+
      '<div style="text-align:right"><span class="band-title" style="background:var(--navy)">التنقلات</span> '+
      '<span class="band-title" style="background:var(--orange)">&#128663; خط سير البرنامج</span></div>'+
      '<div class="itin"><table><thead><tr><th style="width:22mm">التاريخ</th><th>البرنامج والجولات المقترحة</th><th style="width:26mm">المدينة</th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div></section>';
  }
  function pageDelivery(d){
    var apps=(d.delivery_apps||[]).map(function(a){ return '<div class="app">'+esc(a)+'</div>'; }).join("");
    return '<section class="page content">'+
      '<div class="deco d1"></div><div class="deco d2"></div>'+
      '<div class="c-head" dir="ltr"><div class="c-logo">'+logo()+'</div>'+
      '<div class="c-title"><span class="sq"></span><span>'+esc(d.delivery_title)+'</span></div></div>'+
      '<div class="apps">'+apps+'</div></section>';
  }
  function pageCityDivider(c){
    return '<section class="page">'+corners()+
      '<div class="topband" dir="ltr"><span class="t-en">'+esc(c.name_en)+'</span><span class="t-ar">'+esc(c.name_ar)+'</span></div>'+
      '<div class="topband-logo"><div class="logo-circle">'+logo()+'</div></div>'+
      photo(c.photo)+'</section>';
  }
  function pageSection(sec){
    var items=(sec.items||[]);
    var cols = (items.length===4) ? "cols2" : "cols3";
    var enPill = /[A-Za-z]/.test((items[0]&&items[0].name)||"") && !/[\u0600-\u06FF]/.test((items[0]&&items[0].name)||"");
    var grid=items.map(function(it){
      var en=/[A-Za-z]/.test(it.name)&&!/[\u0600-\u06FF]/.test(it.name);
      return '<div class="place">'+circleImg(it.image)+'<span class="place-pill'+(en?" en":"")+'">'+esc(it.name)+'</span></div>';
    }).join("");
    return '<section class="page content">'+
      '<div class="deco d1"></div><div class="deco d2"></div><div class="deco d3"></div>'+
      (sec.halal?'<div class="halal">حلال</div>':"")+
      '<div class="c-head" dir="ltr"><div class="c-logo">'+logo()+'</div>'+
      '<div class="c-title"><span class="sq"></span><span>'+esc(sec.title)+'</span></div></div>'+
      '<div class="circles '+cols+'">'+grid+'</div></section>';
  }
  function pageEmbassy(d){
    var rows=(d.embassy_contacts||[]).map(function(r){
      return '<div class="emb-row"><span class="el">'+esc(r.label)+'</span><span class="ev" dir="ltr">'+esc(r.value)+'</span></div>';
    }).join("");
    return '<section class="page content">'+
      '<div class="deco d1"></div>'+
      '<div class="c-head" dir="ltr"><div class="c-logo">'+logo()+'</div>'+
      '<div class="c-title"><span class="sq"></span><span>'+esc(d.embassy_title)+'</span></div></div>'+
      '<p class="emb-sub">'+esc(d.embassy_subtitle)+'</p>'+
      '<div class="emb"><div class="emb-card"><p class="emb-org">'+esc(d.embassy_org)+'</p>'+rows+
      '<div class="emb-foot" dir="ltr"><span>'+esc(d.embassy_handle)+'</span><span>'+esc(d.embassy_website)+'</span></div></div></div></section>';
  }
  function pageThanks(d){
    var msg=esc(d.thanks_message), en=(BRAND&&BRAND.agency_en)||"";
    if(en) msg=msg.split(esc(en)).join('<span class="en">'+esc(en)+'</span>');
    return '<section class="page">'+corners()+
      '<div style="position:absolute;top:60mm;left:0;right:0;text-align:center"><div class="logo-circle" style="margin:0 auto;width:54mm;height:54mm">'+logo()+'</div></div>'+
      '<div class="thanks"><div class="box">'+msg+'</div></div></section>';
  }
  // ---- Feature 2: flight ticket pages ----
  function ticketSrc(t){ return (t && (t.url || t.ref)) || ""; }
  function isImageTicket(t){
    var m=(t&&t.mime)||"", u=ticketSrc(t);
    return u && (m.indexOf("image/")===0 || u.indexOf("data:image")===0 || /\.(jpe?g|png|gif|webp)$/i.test((t&&t.filename)||""));
  }
  function pageTicket(t){
    return '<section class="page tk-page">'+
      '<div class="tk-head"><span class="tk-t">'+esc(t.title||t.filename||"تذكرة طيران")+'</span>'+
        '<span class="tk-k">تذكرة طيران · '+esc((BRAND&&BRAND.agency_en)||"")+'</span></div>'+
      '<div class="tk-rule"></div>'+
      '<div class="tk-body"><img class="tk-img" src="'+esc(ticketSrc(t))+'"></div>'+
      '<div class="tk-foot">'+esc(t.filename||"")+'</div></section>';
  }

  // ---------- fixed assembly order ----------
  function renderBook(d){
    d=d||{};
    BRAND=brandOf(d);
    var html=colorStyle(BRAND);
    html+=pageCover(d);
    html+=pagesHotels(d);
    html+=pageFlights(d);
    html+=pageItinerary(d);
    html+=pageDelivery(d);
    (d.cities||[]).forEach(function(c){
      html+=pageCityDivider(c);
      (c.sections||[]).forEach(function(sec){ html+=pageSection(sec); });
    });
    html+=pageEmbassy(d);
    html+=pageThanks(d);
    // Feature 2: image tickets become fixed appendix pages; PDF tickets are merged server-side
    var tk=(d.meta&&d.meta.flights&&d.meta.flights.tickets)||[];
    tk.forEach(function(t){ if(isImageTicket(t)) html+=pageTicket(t); });
    return html;
  }
  function render(d, root){ if(root) root.innerHTML=renderBook(d); }

  var SAMPLE_URL="trip-data.json";
  function encodeData(d){ return "#data="+encodeURIComponent(JSON.stringify(d)); }
  function fromHash(){ try{ var h=location.hash||""; if(h.indexOf("#data=")===0) return JSON.parse(decodeURIComponent(h.slice(6))); }catch(e){} return null; }
  function load(){ if(window.__TB_DATA) return Promise.resolve(window.__TB_DATA);
    var h=fromHash(); if(h) return Promise.resolve(h);
    var m=(location.search||"").match(/[?&]data=([^&]+)/); var url=m?decodeURIComponent(m[1]):SAMPLE_URL;
    return fetch(url).then(function(r){ if(!r.ok) throw new Error("data "+r.status); return r.json(); }); }
  function signalReady(root){
    var imgs=Array.prototype.slice.call((root||document).querySelectorAll("img"));
    function done(){ window.__pdfReady=true; document.documentElement.setAttribute("data-pdf-ready","1"); }
    var fp=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    fp.then(function(){ var w=0;(function p(){ if(imgs.every(function(i){return i.complete;})||w>=8000) return done(); w+=100; setTimeout(p,100);})(); }, done);
  }

  window.BOOK={ renderBook:renderBook, render:render, load:load, signalReady:signalReady, encodeData:encodeData, sampleUrl:SAMPLE_URL };
})();
