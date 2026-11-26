const CFG=Object.assign({firebase:null,telegramWorker:'',telegramBot:'',siteUrl:''},window.AMORA_CONFIG||{});
const ENTRY=window.AMORA_ENTRY||'demo';
const LIVE=!!(CFG.firebase&&CFG.firebase.apiKey);
let BK=null;
/* ================= DATA ================= */
const DEPS={kitchen:{ru:'Кухня',hy:'Խոհանոց',en:'Kitchen'},bar:{ru:'Бар',hy:'Բար',en:'Bar'}};
const CATS=[
 {id:'breakfast',dep:'kitchen',hy:'Նախաճաշ',ru:'Завтраки',en:'Breakfast'},
 {id:'lunch',dep:'kitchen',hy:'Լանչ',ru:'Ланч',en:'Lunch'},
 {id:'starters',dep:'kitchen',hy:"Նախուտեստներ",ru:"Закуски",en:"Starters"},
 {id:'salads',dep:'kitchen',hy:"Աղցաններ",ru:"Салаты",en:"Salads"},
 {id:'soups',dep:'kitchen',hy:"Ապուրներ",ru:"Супы",en:"Soups"},
 {id:'mains',dep:'kitchen',hy:"Հիմնական ուտեստներ",ru:"Основные блюда",en:"Main dishes"},
 {id:'pizza',dep:'kitchen',hy:"Պիցցա",ru:"Пицца",en:"Pizza"},
 {id:'khachapuri',dep:'kitchen',hy:"Խաչապուրի",ru:"Хачапури",en:"Khachapuri"},
 {id:'otherfood',dep:'kitchen',hy:'Այլ ուտեստներ',ru:'Другие блюда',en:'Other food'},
 {id:'coffee',dep:'bar',hy:'Սուրճ',ru:'Кофе',en:'Coffee'},
 {id:'tea',dep:'bar',hy:'Թեյ',ru:'Чай',en:'Tea'},
 {id:'soft',dep:'bar',hy:'Զովացուցիչ ըմպելիքներ',ru:'Безалкогольные напитки',en:'Soft drinks'},
 {id:'juice',dep:'bar',hy:'Հյութեր',ru:'Соки',en:'Juices'},
 {id:'lemonade',dep:'bar',hy:'Լիմոնադներ',ru:'Лимонады',en:'Lemonades'},
 {id:'yogurt',dep:'bar',hy:'Յոգուրտներ',ru:'Йогурты',en:'Yogurts'},
 {id:'mocktail',dep:'bar',hy:'Ոչ ալկոհոլային կոկտեյլներ',ru:'Безалкогольные коктейли',en:'Mocktails'},
 {id:'cocktail',dep:'bar',hy:'Կոկտեյլներ',ru:'Коктейли',en:'Cocktails'},
 {id:'shots',dep:'bar',hy:'Շոթեր',ru:'Шоты',en:'Shots'},
 {id:'beer',dep:'bar',hy:'Գարեջուր',ru:'Пиво',en:'Beer'},
 {id:'wine',dep:'bar',hy:'Գինի',ru:'Вино',en:'Wine'},
 {id:'cognac',dep:'bar',hy:'Կոնյակ (50 մլ)',ru:'Коньяк (50 мл)',en:'Brandy (50 ml)'},
 {id:'vodka',dep:'bar',hy:'Օղի',ru:'Водка',en:'Vodka'},
 {id:'spirits',dep:'bar',hy:'Ոգելից խմիչքներ (բաժակ)',ru:'Крепкие напитки (порция)',en:'Spirits (by the glass)'},
 {id:'beersnacks',dep:'bar',hy:'Գարեջրային խորտիկներ',ru:'Закуски к пиву',en:'Beer snacks'},
 {id:'desserts',dep:'bar',hy:'Աղանդեր',ru:'Десерты',en:'Desserts'},
 {id:'otherbev',dep:'bar',hy:'Այլ ըմպելիքներ',ru:'Другие напитки',en:'Other beverages'}];
const catDep=c=>(CATS.find(x=>x.id===c)||{}).dep||'kitchen';
const itemDep=i=>i.dep||(DMAP[i.id]&&DMAP[i.id].dep)||'kitchen';
const depsOf=o=>[...new Set((o.items||[]).map(itemDep))].sort((a,b)=>a===b?0:a==='kitchen'?-1:1);
const M=(id,c,p,w,u,tags,pal,n,d)=>({id,c,p,w,u,tags,pal,n:{ru:n[0],hy:n[1],en:n[2]},d:{ru:d[0],hy:d[1],en:d[2]}});
/* Menu: source of truth = "Amora Menu Redesign" (pages: Starters, 2–6, 8–10, 12, 15). Photos: assets/menu/<id>.webp */
const BASE=[
 M("chicken-strips",'starters',1500,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Куриные стрипсы","Հավի ստրիպսեր","Chicken Strips"],["","",""]),
 M("blinchik",'starters',3000,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Блины с мясом (6шт)","Նրբաբլիթներ(6հտ)","Blinchik (meat-filled crepes) (6pcs)"],["","",""]),
 M("eggplant-rolls",'starters',1900,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Рулетики из баклажанов","Սմբուկով ռուլետ","Eggplant Rolls"],["","",""]),
 M("bruschetta",'starters',3600,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Брускетта","Բրուսկետտա","Bruschetta"],["","",""]),
 M("nectarine-carpaccio",'starters',3500,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Карпаччо из нектарина","Նեկտարինի կարպաչո","Nectarine Carpaccio"],["","",""]),
 M("pear-carpaccio",'starters',3100,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Карпаччо из груши","Տանձի կարպաչո","Pear Carpaccio"],["","",""]),
 M("meat-platter",'starters',3900,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Мясное ассорти","Մսային ասորտի","Meat platter"],["","",""]),
 M("cheese-platter",'starters',3500,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Сырная тарелка","Պանրային ափսե","Cheese platter"],["","",""]),
 M("olive-platter",'starters',1700,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Ассорти из оливок","Ձեյթունի տեսականի","Olive platter"],["","",""]),
 M("lime-and-lemon",'starters',1200,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Лайм-лимон","Լայմ-կիտրոն","Lime & Lemon"],["","",""]),
 M("bread-basket",'starters',500,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Хлебная корзина","Հացի զամբյուղ","Bread Basket"],["","",""]),
 M("french-fries",'starters',1100,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Картофель Фри","Կարտոֆիլ Ֆրի","French Fries"],["","",""]),
 M("crispy-chicken-wings",'starters',2000,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Хрустяшие куриные крылья (6 / 8 шт)","Խրթխրթան հավի թևիկներ (6 / 8 հատ)","Crispy chicken wings (6 / 8 pcs)"],["","",""]),
 M("deep-fried-corn",'starters',2900,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Кукуруза во Фритюре","Խրթխրթան եգիպտացորեն","Deep-Fried Corn"],["","",""]),
 M("cheese-balls",'starters',3300,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Сырные шарики","Պանրային գնդիկներ","Cheese balls"],["","",""]),
 M("crispy-eggs",'starters',3600,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Хрустяшие Яйца","Խրթխրթան ձվեր","Crispy Eggs"],["","",""]),
 M("adjarian-khachapuri",'khachapuri',1500,'','g',[],["#d9a25c", "#f2d27a", "#c8442e"],["Хачапури по-аджарски","Աջարական խաչապուրի","Adjarian khachapuri"],["Яйцо , Моцарелла , тесто","Ձու , Մոցարելլա , խմոր","Egg , Mozzarella , dough"]),
 M("khachapuri-with-basturma",'khachapuri',1700,'','g',[],["#d9a25c", "#f2d27a", "#c8442e"],["Хачапури с бастурмой","Խաչապուրի բաստուրմայով","Khachapuri with basturma"],["Сыр , яйцо , бастурма , тесто","Պանիր , ձու , բաստուրմա , խմոր","Cheese , egg , basturma , dough"]),
 M("khachapuri-with-pork-fillet",'khachapuri',1800,'','g',[],["#d9a25c", "#f2d27a", "#c8442e"],["Хачапури с свиным филе","Խաչապուրի խոզի ֆիլեով","Khachapuri with pork fillet"],["Сыр, яйцо , копчёное свиное филе , свежий острый перец , тесто","Պանիր , ձու, խոզի ապխտած ֆիլե , թարմ կծու պղպեղ , խմոր","Cheese,  egg , smoked pork fillet , fresh hot pepper , dough"]),
 M("tomato-and-egg-boat",'khachapuri',1700,'','g',[],["#d9a25c", "#f2d27a", "#c8442e"],["Лодочка с яичницей и помидорами","Լոլիկով ձվածեղի մակույկ","Tomato and egg boat"],["Помидор , сливочное масло , яйцо , тесто","Լոլիկ , կարագ , ձու , խմոր","Tomato, butter , egg , dough"]),
 M("pepperoni",'pizza',2600,'','g',[],["#c8442e", "#f3e6c4", "#3f7a2c"],["Пепперони","Պեպպերոնի","Pepperoni"],["Пепперони, Моцарелла, базилик, соус наполетано","Պեպպերոնի երշիկ , Մոցարելլա, ռեհան, նապոլետանո սոուս","Pepperoni, Mozzarella , basil, Napoletano sauce"]),
 M("with-ham",'pizza',3500,'','g',[],["#c8442e", "#f3e6c4", "#3f7a2c"],["С Ветчиной","Խոզապուխտով","With Ham"],["Ветчина, грибы, оливки, белый лук, Моцарелла, соус наполетано","Խոզապուխտ, սունկ, ձիթապտուղ, սպիտակ սոխ, Մոցարելլա , նապոլետանո սոուս","Ham, mushrooms, olives, white onion, Mozzarella , Napoletano sauce"]),
 M("4-cheese",'pizza',4300,'','g',[],["#c8442e", "#f3e6c4", "#3f7a2c"],["4 сыра","4 պանիր","4 Cheese"],["Пармезан, Чеддер, Дорблю, Моцарелла, белый соус","Պարմեզան , Չեդդեր , Դորբլյու , Մոցարելլա , սպիտակ սոուս","Parmesan , Cheddar , Dorblu , Mozzarella , White sauce"]),
 M("pesto",'pizza',3900,'','g',[],["#c8442e", "#f3e6c4", "#3f7a2c"],["Песто","Պեստո","Pesto"],["Моцарелла, базилик, свиная шейка, салатный микс, соус песто","Մոցարելլա , ռեհան, խոզի վզամիս, կանաչիների միքս, պեստո սոուս","Mozzarella, basil, pork neck, mixed salad greens, pesto sauce"]),
 M("diablo",'pizza',3600,'','g',[],["#c8442e", "#f3e6c4", "#3f7a2c"],["Диабло","Դիաբլո","Diablo"],["Перец халапеньо, маринованные огурцы, помидоры черри, чоризо, Моцарелла, соус наполетано","Հալապենյո պղպեղ, թթու վարունգ, չերի լոլիկ, չորիզո երշիկ, Մոցարելլա , նապոլետանո սոուս","Jalapeño , pickles, cherry tomatoes, chorizo, Mozzarella cheese, napoletano sauce"]),
 M("tuna-tataki",'salads',3300,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Татаки из тунца","Թունայի տատակի","Tuna Tataki"],["Тунец, салатный микс, редис, морковь, огурец, оливковое масло","Թունա, միքս աղցան , բողկ, գազար, վարունգ, ձիթապտղի ձեթ","Tuna, mixed salad, radish, carrot, cucumber, olive oil"]),
 M("tarragon-salad",'salads',2700,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат с тархуном","Թարխունով աղցան","Tarragon Salad"],["Тархун, салатный микс, сыр фета, чернослив, грецкий орех, кешью, фирменная заправка","Թարխուն,միքս աղցան, ֆետա պանիր, սալորաչիր, ընկույզ, հնդկական ընկույզ, ֆիրմային սոուս","Tarragon, mixed salad greens, feta cheese, prunes, walnuts, cashews, house dressing"]),
 M("rainbow-salad",'salads',3600,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат Радуга","«Ծիածան» աղցան","Rainbow Salad"],["Болгарский перец, говядина, маринованные огурцы, красный лук, фирменная заправка","Բուլղարական պղպեղ, տավարի միս, թթու վարունգ, կարմիր սոխ, ֆիրմային սոուս","Bell pepper, beef, pickled cucumbers, red onion, house dressing"]),
 M("shrimp-and-orange-salad",'salads',3600,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат с креветками и апельсином","Ծովախեցգետնով և նարինջով աղցան","Shrimp and orange salad"],["Креветки, кальмар, апельсин, вяленые помидоры, салатный микс, клюква,оливковое масло, фирменная заправка","Ծովախեցգետին, կաղամար, նարինջ, չորացրած լոլիկ, միքս աղցան , լոռամիրգ , ձիթապտղի ձեթ, ֆիրմային սոուս","Shrimp, squid, orange, sun-dried tomatoes, mixed salad greens , cranberries, olive oil, house dressing"]),
 M("caesar-salad",'salads',2700,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат «Цезарь»","«Կեսար» աղցան","Caesar Salad"],["Салат мароль, куриная грудка, пармезан, помидоры черри, сухарики, соус «Цезарь»","Հազար, հավի կրծքամիս, պարմեզան, չերի լոլիկ , չորահաց, կեսար սոուս","Lettuce, chicken breast, Parmesan, cherry tomatoes, croutons, Caesar dressing"]),
 M("pantaso",'salads',1950,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Пантасо","Պանտասո","Pantaso"],["Баклажан, помидоры черри, плавленый сыр, соевый соус, кисло-сладкий соус, оливковое масло, зелёный лук, кунжут","Սմբուկ, չերի լոլիկ, հալած պանիր,սոյաի սոուս , քաղցրաթթու սոուս, ձիթապտղի ձեթ, կանաչ սոխ, քունջութ","Eggplant, cherry tomatoes, processed cheese, soy sauce , sweet and sour sauce, olive oil, green onions, cilantro, sesame seeds"]),
 M("pork-fillet-salad",'salads',1600,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат с свиным филе","Խոզի ֆիլեով աղցան","Pork Fillet Salad"],["Копчёное свиное филе, копчёный сыр, огурец, болгарский перец","Ապխտած խոզի ֆիլե, ապխտած պանիր, վարունգ, բուլղարական պղպեղ","Smoked pork fillet, smoked cheese, cucumber, bell pepper"]),
 M("chicken-salad",'salads',1700,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат с куриной грудкой","Հավի մսով աղցան","Chicken Salad"],["Куриная грудка, кукуруза, маринованные грибы, грецкий орех, фирменная заправка","Հավի կրծքամիս, եգիպտացորեն, մարինացված սունկ, ընկույզ, ֆիրմային սոուս","Chicken breast, corn, marinated mushrooms, walnuts, house dressing"]),
 M("greek-salad",'salads',1300,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат «Греческий»","Աղցան «Հունական»","Greek Salad"],["Помидоры, огурцы, болгарский перец, красный лук, оливки, маслины, сыр фета, оливковое масло","Լոլիկ, վարունգ, բուլղարական պղպեղ, կարմիր սոխ, կանաչ և սև ձիթապտուղ, ֆետա պանիր, ձիթապտղի ձեթ","Tomatoes, cucumbers, bell pepper, red onion, green and black olives, feta cheese, olive oil"]),
 M("stolichny-salad",'salads',1800,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат «Столичный»","Աղցան «Մայրաքաղաքային»","Stolichny Salad"],["Говядина, картофель, морковь, зелёный горошек, маринованные огурцы, фирменная заправка","Տավարի միս, կարտոֆիլ, գազար, կանաչ ոլոռ, թթու վարունգ, ֆիրմային սոուս","Beef, potatoes, carrots, green peas, pickled cucumbers, , house dressing"]),
 M("arrabbiata-pasta",'mains',3500,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Паста «Арраббьята»","Պաստա «Արրաբիատա»","Arrabbiata Pasta"],["Паста, мидии, креветки, кальмар, пармезан, соус неаполитано","Պաստա, միդիաներ, ծովախեցգետին, կաղամար, պարմեզան, նեապոլիտանո սոուս","Pasta, mussels, shrimp, squid, Parmesan , Neapolitan sauce"]),
 M("carbonara-pasta",'mains',3400,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Паста «Карбонара»","Պաստա «Կարբոնարա»","Carbonara Pasta"],["Паста, бекон, сливки, пармезан, пять видов перца, яйцо","Պաստա, բեկոն, սերուցք, պարմեզան , հինգ տեսակի պղպեղ , ձու","Pasta, bacon, cream, Parmesan , five-pepper blend, egg"]),
 M("seafood-in-cream-sauce",'mains',3800,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Морепродукты в сливочном соусе","Ծովամթերք սերուցքային սոուսով","Seafood in Cream Sauce"],["Мидии, креветки, кальмар, сливки, хлебные сухари, сливочный сыр","Միդիաներ, ծովախեցգետին, կաղամար, սերուցք, հացի փշրանքներ, սերուցքային պանիր","Mussels, shrimp, squid, cream, breadcrumbs, cream cheese"]),
 M("bolognese-pasta",'mains',2200,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Паста «Болоньезе»","Պաստա «Բոլոնեզե»","Bolognese Pasta"],["Паста, пармезан, говяжий фарш, лук, морковь, сельдерей, томатная паста, вино","Պաստա, պարմեզան պանիր, տավարի միս, սոխ, գազար, նեխուր, տոմատի մածուկ, օրեգանո, գինի","Pasta, Parmesan, beef, onion, carrots, celery, tomato paste,  oregano, wine"]),
 M("eggplant-parmigiana",'mains',3500,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Баклажаны «Пармиджана»","Սմբուկ «Պարմիջանա»","Eggplant Parmigiana"],["Баклажаны, соус неаполитано, сырный соус, сулугуни, пармезан","Սմբուկ, նեապոլիտանո սոուս, սուլուգունի, պանրային սոուս, պարմեզան պանիր","Eggplant, Neapolitan sauce, Suluguni , cheese sauce, Parmesan"]),
 M("pork-ribs",'mains',3900,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Свиные рёбрышки","Խոզի կողեր","Pork Ribs"],["Свиные рёбра, брокколи, картофель бейби, кукуруза","Խոզի կողիկներ, բրոկոլի, բեյբի կարտոֆիլ, եգիպտացորեն","Pork ribs, broccoli, baby potatoes, corn"]),
 M("pork-medallions-with-pesh-sauce",'mains',3200,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Свиные медальоны под соусом «Пеш»","Խոզի մեդալիոններ «Պեշ» սոուսով","Pork Medallions with Pesh Sauce"],["Свиные медальоны, грибы, цветная капуста, сливочный соус","Խոզի մեդալիոններ, սունկ, ծաղկակաղամբ, սերուցքային սոուս","Pork medallions, mushrooms, cauliflower, cream sauce"]),
 M("beef-brasato-with-barberries",'mains',5600,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Бразато с барбарисом","Բրազատո ծորենով","Beef Brasato with Barberries"],["Говядина, барбарис, помидоры, красное вино, морковь, сладкий болгарский перец, томатная паста, лук, чеснок, специи","Տավարի միս, ծորեն, լոլիկ, կարմիր գինի, գազար, քաղցր բուլղարական պղպեղ, տոմատի մածուկ, սոխ, սխտոր , համեմունքներ","Beef, barberries, tomatoes, red wine, carrots, sweet bell pepper, tomato paste, onion, garlic, spices"]),
 M("puff-pastry-basket",'mains',4800,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Корзина из слоёного теста","Շերտավոր խմորով զամբյուղ","Puff Pastry Basket"],["Слоёное тесто, куриная грудка, грибы, лук, пармезан , сливочный соус","Շերտավոր խմոր, հավի կրծքամիս, սունկ, սոխ, պարմեզան , սերուցքային սոուս","Puff pastry, chicken breast, mushrooms, onion, Parmesan , cream sauce"]),
 M("halibut-steak-with-sauteed-vegetables",'mains',3100,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Стейк из палтуса с соте","Պալտուսի սթեյք սոթեով","Halibut Steak with Sautéed Vegetables"],["Палтус, морковь, цукини, болгарский перец, фирменная заправка","Պալտուս, գազար, ցուկկինի, բուլղարական պղպեղ, ֆիրմային սոուս","Halibut, carrots, zucchini, bell pepper, house dressing"]),
 M("tolma",'mains',2400,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Долма","Տոլմա","Tolma (Stuffed Grape Leaves)"],["Фарш, рис, виноградные листья, кинза, базилик","Աղացած միս, բրինձ, խաղողի տերևներ, համեմ, ռեհան","Ground meat, rice, grape leaves, cilantro, basil"]),
 M("pan-asian-rice-with-chicken",'mains',3400,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Паназиатский рис с курицей","Պանասիական բրինձ հավի մսով","Pan-Asian Rice with Chicken"],["Куриная грудка, рис с овощами","Հավի կրծքամիս, բրինձ բանջարեղենով","Chicken breast, rice with vegetables"]),
 M("fried-potatoes-with-pork",'mains',2800,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Жареная картошка со свининой","Տապակած կարտոֆիլ խոզի մսով","Fried Potatoes with Pork"],["Свинина, картофель, масло, зелёный лук","Խոզի միս, կարտոֆիլ, ձեթ, կանաչ սոխ","Pork, potatoes, oil, green onions"]),
 M("sausages-with-mashed-potatoes",'mains',1900,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Пюре с колбасками","Կարտոֆիլի պյուրե նրբերշիկներով","Sausages with Mashed Potatoes"],["Сосиски, картофельное пюре, зелёное масло, масло","Նրբերշիկներ, կարտոֆիլի պյուրե, խոտաբույսերով կարագ, կարագ","Sausages, mashed potatoes, herb butter, butter"]),
 M("beef-stroganoff-with-mashed-potatoes",'mains',3000,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Бефстроганов с пюре","Բեֆստրոգանով կարտոֆիլի պյուրեով","Beef Stroganoff with Mashed Potatoes"],["Бефстроганов, картофельное пюре, зелёный лук, петрушка, зелёное масло","Բեֆստրոգանով, կարտոֆիլի պյուրե, կանաչ սոխ, մաղադանոս, խոտաբույսերով կարագ","Beef Stroganoff, mashed potatoes, green onions, parsley, herb butter"]),
 M("schnitzel-with-potatoes",'mains',2300,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Шницель с картофелем по-деревенски","Շնիցել գյուղական կարտոֆիլով","Schnitzel with Potatoes"],["Куриная грудка, картофель,  копчёная паприка, сушёный орегано","Հավի կրծքամիս, կարտոֆիլ, ապխտած պապրիկա, չորացրած օրեգանո","Chicken breast, country-style potatoes, smoked paprika, dried oregano"]),
 M("chicken-and-rice-soup",'soups',2000,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Куриный суп с рисом","Հավի ապուր բրնձով","Chicken and Rice Soup"],["Рис, картофель, морковь, болгарский перец, куриная грудка, лук, укроп, кинза, растительное масло, сливочное масло, базилик","Բրինձ, կարտոֆիլ, գազար, բուլղարական պղպեղ, հավի կրծքամիս, սոխ, սամիթ, համեմ, ձեթ, կարագ, ռեհան","Rice, potatoes, carrots, bell pepper, chicken breast, onion, dill, cilantro, vegetable oil, butter, basil"]),
 M("chicken-soup",'soups',1000,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Куриный суп","Հավապուր","Chicken Soup"],["Рис, картофель, морковь, болгарский перец, куриная грудка, лук, укроп, кинза, растительное масло, сливочное масло, базилик","Բրինձ, կարտոֆիլ, գազար, բուլղարական պղպեղ, հավի կրծքամիս, սոխ, սամիթ, համեմ, ձեթ, կարագ, ռեհան","Rice, potatoes, carrots, bell pepper, chicken breast, onion, dill, cilantro, vegetable oil, butter, basil"]),
 M("pumpkin-cream-soup",'soups',2000,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Тыквенный крем-суп","Դդմով կրեմ-ապուր","Pumpkin Cream Soup"],["Тыква, лук, картофель, чеснок, сливки, оливковое масло, сливочное масло, креветки, тыквенные семечки, сухарики","Դդում, սոխ, կարտոֆիլ, սխտոր, սերուցք, ձիթապտղի ձեթ, կարագ, ծովախեցգետին, դդմի սերմեր, չորահաց","Pumpkin, onion, potatoes, garlic, cream, olive oil, butter, shrimp, pumpkin seeds, croutons"]),
 M("cream-of-mushroom-soup",'soups',1800,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Грибной крем-суп","Սնկով կրեմ-ապուր","Cream of Mushroom Soup"],["Грибы, картофель, лук, сливки, специи, растительное масло, сухарики, зелёное масло","Սունկ, կարտոֆիլ, սոխ, սերուցք, համեմունքներ, ձեթ, չորահաց, խոտաբույսերով կարագ","Mushrooms, potatoes, onion, cream, spices, vegetable oil, croutons, herb butter"]),
 /* POS (касса AMORA), 22.11: позиции, которых не было в печатном меню. Названия HY и цены — как в кассе */
 M("french-toast",'breakfast',1500,'','g',[],["#e3cf9a", "#c98a5a", "#5f8a37"],["Французский тост", "French toast", "French toast"],["","",""]),
 M("german-breakfast",'breakfast',1700,'','g',[],["#e3cf9a", "#c98a5a", "#5f8a37"],["Немецкий завтрак", "German breakfast", "German breakfast"],["","",""]),
 M("persian-breakfast",'breakfast',1700,'','g',[],["#e3cf9a", "#c98a5a", "#5f8a37"],["Персидский завтрак", "Persian breakfast", "Persian breakfast"],["","",""]),
 M("summer-salad-lunch",'lunch',450,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Летний салат (ланч)", "Ամառային աղցան Լանչ", "Summer salad (lunch)"],["","",""]),
 M("rice-lunch",'lunch',1600,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Ланч с рисом", "Բրնձով լանչ", "Lunch with rice"],["","",""]),
 M("mashed-potato-lunch",'lunch',1600,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Ланч с пюре", "Խյուսով լանչ", "Lunch with mashed potatoes"],["","",""]),
 M("cabbage-salad-lunch",'lunch',300,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Салат из капусты (ланч)", "Կաղամբով աղցան Լանչ", "Cabbage salad (lunch)"],["","",""]),
 M("turkey-lunch",'lunch',1600,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Ланч с индейкой", "Հնդկահավով լանչ", "Lunch with turkey"],["","",""]),
 M("greek-salad-lunch",'lunch',600,'','g',[],["#6f9b3f", "#e9d27a", "#c98a5a"],["Греческий салат (ланч)", "Հունական աղցան Լանչ", "Greek salad (lunch)"],["","",""]),
 M("aveluk-salad",'salads',2800,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат с авелуком", "Ավելուկով աղցան", "Aveluk (wild sorrel) salad"],["","",""]),
 M("spinach-salad",'salads',1800,'','g',[],["#6f9b3f", "#e9d27a", "#b8342b"],["Салат со шпинатом", "Սպանախով աղցան", "Spinach salad"],["","",""]),
 M("borscht",'soups',2200,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Борщ", "Բորշ", "Borscht"],["","",""]),
 M("borscht-set",'soups',3000,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Борщ сет", "Բորշ սեթ", "Borscht set"],["","",""]),
 M("noodle-broth",'soups',1300,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Бульон с лапшой", "Լապշայով բուլյոն", "Noodle broth"],["","",""]),
 M("kharcho",'soups',2600,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Харчо", "Խարչո", "Kharcho"],["","",""]),
 M("lentil-cream-soup",'soups',1800,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Чечевичный крем-суп", "Ոսպով կրեմ-ապուր", "Lentil cream soup"],["","",""]),
 M("solyanka",'soups',2000,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Солянка", "Սոլյանկա", "Solyanka"],["","",""]),
 M("spas",'soups',900,'','g',[],["#e0a45e", "#f2d9a0", "#5f8a37"],["Спас", "Սպաս", "Spas (yogurt soup)"],["","",""]),
 M("grilled-vegetables",'starters',2000,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Овощи на гриле", "Բանջարեղենի գրիլ", "Grilled vegetables"],["","",""]),
 M("chicken-burger",'starters',1400,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Бургер с курицей", "Բուրգեր հավի մսով", "Chicken burger"],["","",""]),
 M("beef-burger",'starters',1500,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Бургер с говядиной", "Բուրգեր տավարի մսով", "Beef burger"],["","",""]),
 M("chicken-burger-set",'starters',2200,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Сет с куриным бургером", "Սեթ հավի բուրգերով", "Chicken burger set"],["","",""]),
 M("beef-burger-set",'starters',2400,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Сет с говяжьим бургером", "Սեթ տավարի բուրգերով", "Beef burger set"],["","",""]),
 M("club-sandwich",'starters',2300,'','g',[],["#c98a5a", "#e7c27a", "#5f8a37"],["Клаб-сэндвич", "Քլաբ սենդվիչ", "Club sandwich"],["","",""]),
 M("stuffed-potatoes",'mains',900,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Фаршированный картофель", "Լցոնած կարտոֆիլ", "Stuffed potatoes"],["","",""]),
 M("khinkali-1",'mains',450,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Хинкали (1 шт)", "Խինկալի 1հ", "Khinkali (1 pc)"],["","",""]),
 M("khinkali-4",'mains',2000,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Хинкали (4 шт)", "Խինկալի 4հ", "Khinkali (4 pcs)"],["","",""]),
 M("fried-khinkali-1",'mains',550,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Жареные хинкали (1 шт)", "Տապակած խինկալի 1հ", "Fried khinkali (1 pc)"],["","",""]),
 M("fried-khinkali-4",'mains',2500,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Жареные хинкали (4 шт)", "Տապակած խինկալի 4հ", "Fried khinkali (4 pcs)"],["","",""]),
 M("chashushuli",'mains',3700,'','g',[],["#7a3a22", "#c9874a", "#5f8a37"],["Чашушули", "Չաշուշուլի", "Chashushuli"],["","",""]),
 /* Барная карта и десерты — из списка ресторана 22.11 (названия HY и цены как в списке) */
 M("oriental-coffee",'coffee',600,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Кофе по-восточному", "Արևելյան", "Oriental coffee"],["","",""]),
 M("french-coffee",'coffee',700,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Кофе по-французски", "Ֆրանսիական", "French coffee"],["","",""]),
 M("nescafe",'coffee',800,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Нескафе", "Նեսկաֆե", "Nescafé"],["","",""]),
 M("hot-chocolate",'coffee',700,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Горячий шоколад", "Տաք Շոկոլադ", "Hot chocolate"],["","",""]),
 M("cappuccino",'coffee',700,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Капучино", "Կապուչինո", "Cappuccino"],["","",""]),
 M("dalgona-honey",'coffee',1200,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Далгона с мёдом", "Դալգոնա մեղրով", "Dalgona with honey"],["","",""]),
 M("mak-coffee",'coffee',600,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Мак кофе", "Մակ սուրճ", "Mak coffee"],["","",""]),
 M("espresso",'coffee',800,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Эспрессо", "Էսպրեսսո", "Espresso"],["","",""]),
 M("americano",'coffee',1000,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Американо", "Ամերիկանո", "Americano"],["","",""]),
 M("latte",'coffee',1200,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Латте", "Լատտե", "Latte"],["","",""]),
 M("affogato",'coffee',1700,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Аффогато", "Աֆֆոգատո", "Affogato"],["","",""]),
 M("raf",'coffee',1500,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Раф", "Ռաֆ", "Raf coffee"],["","",""]),
 M("viennese-coffee",'coffee',1700,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Венский кофе", "Վիեննական", "Viennese coffee"],["","",""]),
 M("mocha",'coffee',1800,'','g',[],["#5a3a24", "#c9a27a", "#e8d9c0"],["Мокко", "Մոկկո", "Mocha"],["","",""]),
 M("black-tea",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Чёрный чай", "Սև թեյ", "Black tea"],["","",""]),
 M("green-tea",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Зелёный чай", "Կանաչ թեյ", "Green tea"],["","",""]),
 M("floral-tea",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Цветочный чай", "Ծաղիկներով", "Floral tea"],["","",""]),
 M("cinnamon-tea",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Чай с корицей", "Դարչինով", "Cinnamon tea"],["","",""]),
 M("karkade",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Каркаде", "Կարկադե", "Hibiscus tea (karkade)"],["","",""]),
 M("strawberry-basil-tea",'tea',2200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Клубника-базилик", "Ելակ-Բազիլիկ", "Strawberry-basil tea"],["","",""]),
 M("mojito-hot",'tea',2500,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Мохито Hot", "Մոխիտո Hot", "Mojito Hot"],["","",""]),
 M("berry-tea",'tea',2500,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Ягодный чай", "Հատապտղային", "Berry tea"],["","",""]),
 M("ararat-tea",'tea',2700,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Чай «Арарат»", "Արարատ", "Ararat tea"],["","",""]),
 M("mix-tea",'tea',1200,'','g',[],["#8a5a2a", "#d9b36a", "#6f9b3f"],["Микс", "Միքս", "Mix tea"],["","",""]),
 M("coca-fanta-sprite",'soft',400,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Кока-кола / Фанта / Спрайт 0,25", "Կոկա / Ֆանտա / Սպրայտ 0.25", "Coca-Cola / Fanta / Sprite 0.25"],["","",""]),
 M("byureg-water",'soft',300,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Бюрег 0,5", "Բյուրեղ 0.5", "Byureg 0.5"],["","",""]),
 M("bonaqua",'soft',300,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["BonAqua 0,5", "BonAqua 0.5", "BonAqua 0.5"],["","",""]),
 M("jermuk",'soft',350,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Джермук 0,5", "Ջերմուկ 0.5", "Jermuk 0.5"],["","",""]),
 M("compote",'soft',1500,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Компот", "Կոմպոտ", "Compote"],["","",""]),
 M("schweppes",'soft',600,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Швепс", "Շվեփս", "Schweppes"],["","",""]),
 M("iced-tea",'soft',700,'','g',[],["#c8442e", "#e9d27a", "#7fc3d9"],["Холодный чай", "Սառը թեյ", "Iced tea"],["","",""]),
 M("natural-juice",'juice',500,'','g',[],["#e8a23a", "#f2d27a", "#6f9b3f"],["Натуральный сок", "Բնական հյութ", "Natural juice"],["","",""]),
 M("citrus-lemonade",'lemonade',2700,'','g',[],["#e9d27a", "#9ccf6a", "#7fc3d9"],["Цитрусовый лимонад", "Ցիտրուսային լիմոնադ", "Citrus lemonade"],["","",""]),
 M("amora-lemonade",'lemonade',2500,'','g',[],["#e9d27a", "#9ccf6a", "#7fc3d9"],["Лимонад Amora", "Amora լիմոնադ", "Amora lemonade"],["","",""]),
 M("seasons-lemonade",'lemonade',2000,'','g',[],["#e9d27a", "#9ccf6a", "#7fc3d9"],["Лимонад Seasons", "Seasons լիմոնադ", "Seasons lemonade"],["","",""]),
 M("yogurt-fruit",'yogurt',1400,'','g',[],["#f2ead8", "#c8442e", "#e9d27a"],["Йогурт с фруктами", "Յոգուրտ մրգերով", "Yogurt with fruit"],["","",""]),
 M("yogurt-jam",'yogurt',1200,'','g',[],["#f2ead8", "#c8442e", "#e9d27a"],["Йогурт с вареньем", "Յոգուրտ մուրաբայով", "Yogurt with jam"],["","",""]),
 M("yogurt-honey",'yogurt',1500,'','g',[],["#f2ead8", "#c8442e", "#e9d27a"],["Йогурт с мёдом", "Յոգուրտ մեղրով", "Yogurt with honey"],["","",""]),
 M("yogurt-amora",'yogurt',1700,'','g',[],["#f2ead8", "#c8442e", "#e9d27a"],["Йогурт Amora", "Յոգուրտ Amora", "Yogurt Amora"],["","",""]),
 M("mk-shadone",'mocktail',1700,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Shadane", "Shadane", "Shadane"],["","",""]),
 M("mk-mojito",'mocktail',1500,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Mojito", "Mojito", "Mojito"],["","",""]),
 M("mk-blue-lagoon",'mocktail',1700,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Blue Lagoon", "Blue Lagoon", "Blue Lagoon"],["","",""]),
 M("mk-honeymoon",'mocktail',1700,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Honeymoon", "Honeymoon", "Honeymoon"],["","",""]),
 M("mk-zarra",'mocktail',1500,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Zarra", "Zarra", "Zarra"],["","",""]),
 M("mk-pina-colada",'mocktail',1700,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Pina Colada", "Pina Colada", "Pina Colada"],["","",""]),
 M("mk-tropican",'mocktail',2000,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Tropican", "Tropican", "Tropican"],["","",""]),
 M("mk-milkshake",'mocktail',1200,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Милкшейк", "Milkshake", "Milkshake"],["","",""]),
 M("mk-strawberry-banana-ice",'mocktail',2000,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Strawberry-banana Ice", "Strawberry-banana Ice", "Strawberry-banana Ice"],["","",""]),
 M("mk-glace",'mocktail',1500,'','g',[],["#7fc3d9", "#e9d27a", "#c8442e"],["Гляссе", "Glace", "Glace"],["","",""]),
 M("sh-b-52",'shots',4500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["B-52", "B-52", "B-52"],["","",""]),
 M("sh-b-53",'shots',4500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["B-53", "B-53", "B-53"],["","",""]),
 M("sh-hirosima",'shots',4000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Herosima", "Herosima", "Herosima"],["","",""]),
 M("sh-eldorado",'shots',3500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Eldorado", "Eldorado", "Eldorado"],["","",""]),
 M("sh-universe",'shots',3500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Universe", "Universe", "Universe"],["","",""]),
 M("sh-bloody-jelly",'shots',3000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Bloody Jelly", "Bloody Jelly", "Bloody Jelly"],["","",""]),
 M("sh-amore-sour",'shots',3000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Amore Sour", "Amore Sour", "Amore Sour"],["","",""]),
 M("sh-kamikadze",'shots',2500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Kamikadze", "Kamikadze", "Kamikadze"],["","",""]),
 M("sh-pina-colada",'shots',3000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Pina Colada", "Pina Colada", "Pina Colada"],["","",""]),
 M("sh-amigo",'shots',3500,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Amigo", "Amigo", "Amigo"],["","",""]),
 M("sh-hurricane",'shots',4000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Hurricane", "Hurricane", "Hurricane"],["","",""]),
 M("sh-nutty",'shots',3000,'','g',[],["#3a2a1a", "#e8a23a", "#b8342b"],["Nutty", "Nutty", "Nutty"],["","",""]),
 M("ck-mojito",'cocktail',2700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Mojito", "Mojito", "Mojito"],["","",""]),
 M("ck-blue-lagoon",'cocktail',2000,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Blue Lagoon", "Blue Lagoon", "Blue Lagoon"],["","",""]),
 M("ck-long-island",'cocktail',3500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Long Island", "Long Island", "Long Island"],["","",""]),
 M("ck-martini-dry",'cocktail',2500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Martini Dry", "Martini Dry", "Martini Dry"],["","",""]),
 M("ck-screwdriver",'cocktail',1700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Screwdriver", "Screwdriver", "Screwdriver"],["","",""]),
 M("ck-blink",'cocktail',4000,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Blink", "Blink", "Blink"],["","",""]),
 M("ck-beso-negro",'cocktail',2700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Beso Negro", "Beso Negro", "Beso Negro"],["","",""]),
 M("ck-espresso-martini",'cocktail',2400,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Espresso Martini", "Espresso Martini", "Espresso Martini"],["","",""]),
 M("ck-bad-weather",'cocktail',3700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Bad Weather", "Bad Weather", "Bad Weather"],["","",""]),
 M("ck-americano-bond",'cocktail',3000,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Americano Bond", "Americano Bond", "Americano Bond"],["","",""]),
 M("ck-green-garden",'cocktail',2700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Green Garden", "Green Garden", "Green Garden"],["","",""]),
 M("ck-crimson-star",'cocktail',2200,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Crimson Star", "Crimson Star", "Crimson Star"],["","",""]),
 M("ck-negroni",'cocktail',3300,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Negroni", "Negroni", "Negroni"],["","",""]),
 M("ck-margarita",'cocktail',3000,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Margarita", "Margarita", "Margarita"],["","",""]),
 M("ck-aisha",'cocktail',4700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Aisha", "Aisha", "Aisha"],["","",""]),
 M("ck-godfather",'cocktail',3700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Godfather", "Godfather", "Godfather"],["","",""]),
 M("ck-godmother",'cocktail',3200,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Godmother", "Godmother", "Godmother"],["","",""]),
 M("ck-army",'cocktail',3500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Army", "Army", "Army"],["","",""]),
 M("ck-grigoryans",'cocktail',3000,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Grigoryan’s", "Grigoryan’s", "Grigoryan’s"],["","",""]),
 M("ck-russian-campari",'cocktail',2500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Russian Campari", "Russian Campari", "Russian Campari"],["","",""]),
 M("ck-bumble-aperol",'cocktail',2700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Bumble Aperol", "Bumble Aperol", "Bumble Aperol"],["","",""]),
 M("ck-daiquiri",'cocktail',2700,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Daiquiri", "Daiquiri", "Daiquiri"],["","",""]),
 M("ck-rainbow",'cocktail',3200,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Rainbow", "Rainbow", "Rainbow"],["","",""]),
 M("ck-jagermonster",'cocktail',2500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["Jagermonster", "Jagermonster", "Jagermonster"],["","",""]),
 M("ck-white-russian",'cocktail',2500,'','g',[],["#b8342b", "#e9d27a", "#7fc3d9"],["White Russian", "White Russian", "White Russian"],["","",""]),
 M("ice-cream",'desserts',1000,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Мороженое", "Պաղպաղակ", "Ice cream"],["","",""]),
 M("ice-cream-drunk-cherry",'desserts',1300,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Мороженое «Пьяная вишня»", "Պաղպաղակ „Пьяная вишня“", "Ice cream \"Drunken cherry\""],["","",""]),
 M("ice-cream-amora",'desserts',1500,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Мороженое «Amora»", "Պաղպաղակ „Amora“", "Ice cream \"Amora\""],["","",""]),
 M("cheesecake-classic",'desserts',1700,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Чизкейк классический", "Չիզքեյք դասական", "Classic cheesecake"],["","",""]),
 M("cheesecake-fruit-glaze",'desserts',2000,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Чизкейк с фруктовой глазурью", "Չիզքեյք մրգային գլազուրով", "Cheesecake with fruit glaze"],["","",""]),
 M("toffee",'desserts',1500,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Тоффи «Ириска»", "Toffee Իրիսկա", "Toffee"],["","",""]),
 M("tiramisu-ice-cream",'desserts',2000,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Тирамису-мороженое", "Տիրամիսու-պաղպաղակ", "Tiramisu ice cream"],["","",""]),
 M("chocmange",'desserts',1700,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Шокманже", "Շոկմանժե", "Chocmange"],["","",""]),
 M("fruit-platter",'desserts',3000,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Фруктовая тарелка", "Մրգային ափսե", "Fruit platter"],["","",""]),
 M("macarons",'desserts',2000,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Макарон", "Մակառուն", "Macarons"],["","",""]),
 M("watermelon-melon",'desserts',2500,'','g',[],["#c8442e","#9ccf6a","#e9d27a"],["Арбуз, дыня","Ձմերուկ, սեխ","Watermelon, melon"],["","",""]),
 M("honey-cake",'desserts',1200,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Медовик", "Մեղրով տորթ", "Honey cake"],["","",""]),
 M("baklava",'desserts',1300,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Пахлава", "Փախլավա", "Baklava"],["","",""]),
 /* Касса AMORA (bar_menu_4.zip, 22.11): алкоголь, пиво, закуски к пиву, десерт. Названия HY и цены — как в кассе */
 M("beer-bitburger",'beer',1100,'','g',[],["#e8a23a", "#f2d27a", "#fff3d0"],["Пиво Bitburger 0,33 л", "Գարեջուր Bitburger 0,33լ", "Bitburger beer 0.33 l"],["","",""]),
 M("beer-estrella",'beer',1000,'','g',[],["#e8a23a", "#f2d27a", "#fff3d0"],["Пиво Estrella 0,33 л", "Գարեջուր Estrella 0,33լ", "Estrella beer 0.33 l"],["","",""]),
 M("beer-warsteiner",'beer',1100,'','g',[],["#e8a23a", "#f2d27a", "#fff3d0"],["Пиво Warsteiner 0,33 л", "Գարեջուր Warsteiner 0,33լ", "Warsteiner beer 0.33 l"],["","",""]),
 M("beer-mayners",'beer',1000,'','g',[],["#e8a23a", "#f2d27a", "#fff3d0"],["Пиво «Майнерс» 0,5 л", "Գարեջուր Մայներս 0.5լ", "Mayners beer 0.5 l"],["","",""]),
 M("wine-armenia",'wine',3000,'','g',[],["#7a1f2b", "#c8442e", "#e9d27a"],["Вино Armenia", "Գինի Armenia", "Armenia wine"],["","",""]),
 M("wine-baron",'wine',4500,'','g',[],["#7a1f2b", "#c8442e", "#e9d27a"],["Вино Baron", "Գինի Baron", "Baron wine"],["","",""]),
 M("wine-minas",'wine',2500,'','g',[],["#7a1f2b", "#c8442e", "#e9d27a"],["Вино Minas", "Գինի Minas", "Minas wine"],["","",""]),
 M("wine-van-ardi",'wine',2500,'','g',[],["#7a1f2b", "#c8442e", "#e9d27a"],["Вино Van Ardi", "Գինի Van Ardi", "Van Ardi wine"],["","",""]),
 M("cognac-ararat-5",'cognac',1500,'','g',[],["#a0522d", "#e8a23a", "#5a3a24"],["Коньяк «Арарат» 5* 50 мл", "Կոնյակ Արարատ 5* 50մլ", "Ararat 5* brandy 50 ml"],["","",""]),
 M("cognac-ararat-7",'cognac',2000,'','g',[],["#a0522d", "#e8a23a", "#5a3a24"],["Коньяк «Арарат» 7* 50 мл", "Կոնյակ Արարատ 7* 50մլ", "Ararat 7* brandy 50 ml"],["","",""]),
 M("cognac-ararat-10",'cognac',2500,'','g',[],["#a0522d", "#e8a23a", "#5a3a24"],["Коньяк «Арарат» 10* 50 мл", "Կոնյակ Արարատ 10* 50մլ", "Ararat 10* brandy 50 ml"],["","",""]),
 M("cognac-nairi-20",'cognac',6500,'','g',[],["#a0522d", "#e8a23a", "#5a3a24"],["Коньяк «Наири» 20* 50 мл", "Կոնյակ Նաիրի 20* 50մլ", "Nairi 20* brandy 50 ml"],["","",""]),
 M("vodka-finlandia",'vodka',2000,'','g',[],["#cfe3ea", "#7fc3d9", "#e9d27a"],["Водка Finlandia 50 мл", "Օղի Finlandia 50մլ", "Finlandia vodka 50 ml"],["","",""]),
 M("vodka-kremlin-classic",'vodka',1200,'','g',[],["#cfe3ea", "#7fc3d9", "#e9d27a"],["Водка Kremlin Classic 50 мл", "Օղի Kremlin Classic 50մլ", "Kremlin Classic vodka 50 ml"],["","",""]),
 M("vodka-kremlin-premium",'vodka',1700,'','g',[],["#cfe3ea", "#7fc3d9", "#e9d27a"],["Водка Kremlin Premium 50 мл", "Օղի Kremlin Premium 50մլ", "Kremlin Premium vodka 50 ml"],["","",""]),
 M("vodka-chistye-rosy",'vodka',2000,'','g',[],["#cfe3ea", "#7fc3d9", "#e9d27a"],["Водка «Чистые росы» 50 мл", "Օղի Чистые Росы 50մլ", "Chistye Rosy vodka 50 ml"],["","",""]),
 M("sp-bacardi-black",'spirits',2500,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Bacardi Black 50 мл", "Bacardi Black 50մլ", "Bacardi Black 50 ml"],["","",""]),
 M("sp-bacardi-white",'spirits',2300,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Bacardi White 50 мл", "Bacardi White 50մլ", "Bacardi White 50 ml"],["","",""]),
 M("sp-barrister",'spirits',1200,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Barrister 50 мл", "Barrister 50մլ", "Barrister 50 ml"],["","",""]),
 M("sp-beefeater",'spirits',1500,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Beefeater 50 мл", "Beefeater 50մլ", "Beefeater 50 ml"],["","",""]),
 M("sp-chivas-18",'spirits',5500,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Chivas 18 50 мл", "Chivas 18 50մլ", "Chivas 18 50 ml"],["","",""]),
 M("sp-don-julio",'spirits',5000,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Don Julio 50 мл", "Don Julio 50մլ", "Don Julio 50 ml"],["","",""]),
 M("sp-grants",'spirits',2000,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Grant's 50 мл", "Grant's 50մլ", "Grant's 50 ml"],["","",""]),
 M("sp-hendricks",'spirits',3000,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Hendrick's 50 мл", "Hendrick's 50մլ", "Hendrick's 50 ml"],["","",""]),
 M("sp-jack-daniels",'spirits',2500,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Jack Daniels 50 мл", "Jack Daniels 50մլ", "Jack Daniels 50 ml"],["","",""]),
 M("sp-red-label",'spirits',2000,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Red Label 50 мл", "Red Label 50մլ", "Red Label 50 ml"],["","",""]),
 M("sp-bombay-gin",'spirits',1800,'','g',[],["#8a5a2a", "#e8a23a", "#5a3a24"],["Джин Bombay", "Ջին Bombay", "Bombay gin"],["","",""]),
 M("bs-carrot",'beersnacks',700,'','g',[],["#e8a23a", "#c98a5a", "#6f9b3f"],["Морковь", "Գազար", "Carrots"],["","",""]),
 M("bs-beer-set",'beersnacks',5000,'','g',[],["#e8a23a", "#c98a5a", "#6f9b3f"],["Пивной сет", "Գարեջրի հավաքածու", "Beer snack set"],["","",""]),
 M("bs-chips",'beersnacks',1000,'','g',[],["#e8a23a", "#c98a5a", "#6f9b3f"],["Чипсы Lays / Pringles", "Չիպս Lays/Pringles", "Lays / Pringles chips"],["","",""]),
 M("bs-panrik",'beersnacks',1200,'','g',[],["#e8a23a", "#c98a5a", "#6f9b3f"],["Панрик (сырная закуска)", "Պանրիկ", "Panrik (cheese snack)"],["","",""]),
 M("bs-pistachio",'beersnacks',1500,'','g',[],["#e8a23a", "#c98a5a", "#6f9b3f"],["Фисташки", "Պիստակ", "Pistachios"],["","",""]),
 M("cheesecake-3-chocolates",'desserts',2300,'','g',[],["#7a4a2a", "#f2d9a0", "#c8442e"],["Чизкейк «3 шоколада»", "Չիզքեյք \"3 շոկոլադ\"", "Cheesecake \"3 chocolates\""],["","",""]),
];
const PHOTOS={"chicken-strips": 1, "eggplant-rolls": 1, "bruschetta": 1, "french-fries": 1, "deep-fried-corn": 1, "cheese-balls": 1, "crispy-eggs": 1, "adjarian-khachapuri": 1, "khachapuri-with-basturma": 1, "khachapuri-with-pork-fillet": 1, "tomato-and-egg-boat": 1, "pepperoni": 1, "with-ham": 1, "4-cheese": 1, "pesto": 1, "diablo": 1, "tuna-tataki": 1, "shrimp-and-orange-salad": 1, "pantaso": 1, "chicken-salad": 1, "greek-salad": 1, "carbonara-pasta": 1, "seafood-in-cream-sauce": 1, "bolognese-pasta": 1, "eggplant-parmigiana": 1, "pork-ribs": 1, "beef-brasato-with-barberries": 1, "halibut-steak-with-sauteed-vegetables": 1, "tolma": 1, "pan-asian-rice-with-chicken": 1, "fried-potatoes-with-pork": 1, "sausages-with-mashed-potatoes": 1, "beef-stroganoff-with-mashed-potatoes": 1, "schnitzel-with-potatoes": 1, "pumpkin-cream-soup": 1, "cream-of-mushroom-soup": 1, "chicken-and-rice-soup": 1, "chicken-soup": 1, "puff-pastry-basket": 1, "olive-platter": 1, "pear-carpaccio": 1, "nectarine-carpaccio": 1, "blinchik": 1, "cheese-platter": 1, "caesar-salad": 1, "lime-and-lemon": 1, "tarragon-salad": 1, "bread-basket": 1, "stolichny-salad": 1, "rainbow-salad": 1, "crispy-chicken-wings": 1, "meat-platter": 1, "pork-medallions-with-pesh-sauce": 1, "pork-fillet-salad": 1, "arrabbiata-pasta": 1};
const L3=(ru,hy,en,p=0)=>({ru,hy,en,p});
const OPTS={
'cappuccino':[{id:'size',ru:'Размер',hy:'Չափ',en:'Size',ch:[L3('Обычный','Սովորական','Regular'),L3('Большой','Մեծ','Large',600)]}],
'natural-juice':[{id:'vol',ru:'Объём',hy:'Ծավալ',en:'Volume',ch:[L3('0,33 л','0.33 լ','0.33 l'),L3('1 л','1 լ','1 l',1000)]}],
'coca-fanta-sprite':[{id:'kind',ru:'Напиток',hy:'Ըմպելիք',en:'Drink',ch:[L3('Coca-Cola','Կոկա','Coca-Cola'),L3('Fanta','Ֆանտա','Fanta'),L3('Sprite','Սպրայտ','Sprite')]}],
'ice-cream':[{id:'fl',ru:'Вкус',hy:'Համ',en:'Flavour',ch:[L3('Ванильное','Վանիլային','Vanilla'),L3('Шоколадное','Շոկոլադե','Chocolate'),L3('Фруктовое','Մրգային','Fruit')]}],
'fruit-platter':[{id:'size',ru:'Размер',hy:'Չափ',en:'Size',ch:[L3('Маленькая','Փոքր','Small'),L3('Большая','Մեծ','Large',3000)]}],

 'crispy-chicken-wings':[{id:'pcs',ru:'Количество',hy:'Քանակ',en:'Quantity',ch:[L3('6 шт','6 հատ','6 pcs'),L3('8 шт','8 հատ','8 pcs',600)]}],
};
const ALG={};
const ALGN={gluten:L3('Глютен','Սնձան','Gluten'),milk:L3('Молоко','Կաթ','Milk'),egg:L3('Яйцо','Ձու','Egg'),nuts:L3('Орехи','Ընկույզ','Nuts'),fish:L3('Рыба','Ձուկ','Fish'),shell:L3('Морепродукты','Ծովամթերք','Shellfish'),sesame:L3('Кунжут','Քունջութ','Sesame')};
const REASONS=[{k:'out',...L3('Блюдо закончилось','Ուտեստը վերջացել է','A dish ran out')},{k:'zone',...L3('Не доставляем по этому адресу','Այս հասցեով չենք առաքում','We do not deliver to this address')},{k:'busy',...L3('Кухня перегружена','Խոհանոցը ծանրաբեռնված է','Kitchen is overloaded')},{k:'closed',...L3('Ресторан закрывается','Ռեստորանը փակվում է','Restaurant is closing')}];
BASE.forEach(d=>{d.opts=OPTS[d.id]||null;d.alg=ALG[d.id]||[];d.photo=PHOTOS[d.id]?'assets/menu/'+d.id:null});
const BMAP=Object.fromEntries(BASE.map(d=>[d.id,d]));
const HERO='adjarian-khachapuri';
let DISHES=BASE.slice(),DMAP={...BMAP};

/* ================= I18N ================= */
const T={
ru:{tag:'Ресторан · Капан',h1:'Вкус, в который<br><i>влюбляются</i>',lead:'Авторская армянская и европейская кухня. Доставка по Капану, самовывоз и заказ прямо со столика — без регистрации.',ctaMenu:'Открыть меню',ctaBook:'Забронировать стол',openUntil:'Открыто до',delivery:'Доставка',pickup:'Самовывоз',dinein:'В зале',min:'мин',menu:'Меню',search:'Найти блюдо…',hit:'Хит',new:'Новинка',veg:'Без мяса',spicy:'Острое',add:'Добавить',choose:'Выбрать',soldOut:'Сегодня нет',cart:'Корзина',yourOrder:'Ваш заказ',emptyCart:'Корзина пока пуста',emptySub:'Добавьте что-нибудь вкусное из меню',items:'Блюда',free:'бесплатно',total:'Итого',toFree:'До бесплатной доставки',minOrder:'Минимальная сумма доставки',checkout:'Оформить заказ',goes:'К этому часто берут',name:'Имя',phone:'Телефон',street:'Улица и дом',apt:'Кв. / подъезд / этаж',zone:'Район',when:'Когда',asap:'Как можно скорее',later:'Ко времени',payment:'Оплата',cash:'Наличными',cashS:'Курьеру или на кассе',card:'Картой через терминал',cardS:'Курьер привезёт терминал',change:'Подготовить сдачу с',comment:'Комментарий',commentPh:'Без лука, позвонить заранее…',place:'Отправить заказ',noLogin:'Без регистрации. Оплата при получении.',table:'Стол',yourTable:'Ваш стол',tableNote:'Заказ сразу уйдёт официанту и на кухню',callWaiter:'Позвать официанта',callS:'Подойдёт к столу',askBill:'Попросить счёт',billS:'Наличные или карта',called:'Официант уже идёт',billAsked:'Счёт несут',tableBill:'Заказано за этим столом',sendKitchen:'Отправить на кухню',thanks:'Спасибо! Заказ принят',orderN:'Заказ',eta:'Ориентировочно',live:'Статус обновляется в реальном времени',myOrders:'Мои заказы',featT:'Больше, чем меню.<br>Сервис, к которому привыкают',f1:'Заказ со столика',f1s:'QR-код на каждом столе: меню, заказ, вызов официанта и счёт — в телефоне гостя.',f2:'Доставка и самовывоз',f2s:'Точное время, зоны доставки по Капану, статус заказа онлайн.',f3:'Без регистрации',f3s:'Имя и телефон — и всё. Оплата наличными или картой при получении.',f4:'Всегда актуально',f4s:'Если блюдо закончилось — гость сразу видит это на сайте.',bookT:'Бронь<br>столика',bookS:'Оставьте заявку — администратор перезвонит и подтвердит бронь.',guests:'Гостей',date:'Дата',time:'Время',send:'Отправить заявку',bookOk:'Заявка отправлена — мы перезвоним для подтверждения',contacts:'Контакты',hours:'Часы работы',daily:'Ежедневно',addr:'г. Капан, Армения',follow:'Мы в соцсетях',fillNP:'Укажите имя и телефон',fillA:'Укажите адрес доставки',added:'Добавлено',unavail:'временно не принимаем',st_new:'Принят',st_cooking:'Готовится',st_ready:'Готов',st_readyP:'Ждёт вас',st_onway:'Курьер в пути',st_done:'Доставлен',st_doneP:'Выдан',st_doneT:'Подан',st_cancel:'Отменён',stS_new:'Ресторан получил заказ',stS_cooking:'Шеф уже готовит',stS_ready:'Упаковываем',stS_onway:'Скоро будет у вас',g:'г',ml:'мл',all:'Все',nothing:'Ничего не нашлось',kitchenBusy:'Высокая загрузка кухни',repeat:'Повторить',closedNow:'Сейчас закрыто',opensAt:'откроемся в',preorder:'Сейчас закрыто — примем предзаказ ко времени',allergens:'Аллергены',rate:'Оцените заказ',rateThanks:'Спасибо за отзыв!',reviewPh:'Что понравилось или что улучшить?',courier:'Курьер',reason:'Причина',saved:'Данные запомнены на этом устройстве',promoL:'Предложение недели',noOrders:'Заказов пока нет',open:'Открыть',sendR:'Отправить отзыв',addedAgain:'Заказ снова в корзине',rtEyebrow:'Рейтинг гостей AMORA',rtTitle:'Приходите чаще —<br><i>платите меньше</i>',rtLead:'Каждый заказ с вашим номером телефона приносит баллы. Лучшие гости месяца получают скидку на весь следующий месяц. Без регистрации и приложений.',rtBoard:'Рейтинг',rs1:'Называйте номер',rs1s:'При заказе на сайте, со столика или на кассе.',rs2:'Копите баллы',rs2s:'1 балл за каждые {per} ֏ и +{visit} за каждый визит.',rs3:'Получайте скидку',rs3s:'Топ-{top} месяца получает скидку на весь следующий месяц — она применяется сама.',rtCheck:'Узнать своё место',rtFind:'Проверить',fillPhone:'Введите номер в формате +374 XX XXX XXX',rtNone:'Пока нет баллов',rtNoneS:'Сделайте первый заказ с этим номером — и вы в игре.',rtToNext:'До {p}-го места — {n} баллов',pts:'баллов',rtYourDisc:'ваша скидка в этом месяце',rtNoDisc:'Скидки в этом месяце нет — поднимайтесь в топ, чтобы получить её в следующем.',rtTg:'Подтвердить номер в Telegram',rtShort:'Рейтинг',rtEmpty:'В этом месяце рейтинг только начинается — станьте первым!',discL:'Скидка рейтинга',willEarn:'в рейтинг за этот заказ',tName:'Имя (для рейтинга)',tPhone:'Телефон — баллы и скидка',optional:'необязательно',tgFollow:'Следить за заказом в Telegram',tgOn:'Статусы придут в Telegram',svc:'Обслуживание',tblRt:'Укажите номер при заказе — получите баллы в рейтинг гостей и скидку',qrBad:'Код стола устарел — попросите официанта'},
hy:{tag:'Ռեստորան · Կապան',h1:'Համ, որին<br><i>սիրահարվում են</i>',lead:'Հեղինակային հայկական և եվրոպական խոհանոց։ Առաքում Կապանում, ինքնատար և պատվեր անմիջապես սեղանից՝ առանց գրանցման։',ctaMenu:'Բացել ճաշացանկը',ctaBook:'Ամրագրել սեղան',openUntil:'Բաց է մինչև',delivery:'Առաքում',pickup:'Ինքնատար',dinein:'Սրահում',min:'րոպե',menu:'Ճաշացանկ',search:'Որոնել ուտեստ…',hit:'Հիթ',new:'Նորույթ',veg:'Առանց մսի',spicy:'Կծու',add:'Ավելացնել',choose:'Ընտրել',soldOut:'Այսօր չկա',cart:'Զամբյուղ',yourOrder:'Ձեր պատվերը',emptyCart:'Զամբյուղը դեռ դատարկ է',emptySub:'Ավելացրեք մի համեղ բան ճաշացանկից',items:'Ուտեստներ',free:'անվճար',total:'Ընդամենը',toFree:'Մինչև անվճար առաքում',minOrder:'Առաքման նվազագույն գումար',checkout:'Ձևակերպել պատվերը',goes:'Սրա հետ հաճախ վերցնում են',name:'Անուն',phone:'Հեռախոս',street:'Փողոց և շենք',apt:'Բն. / մուտք / հարկ',zone:'Թաղամաս',when:'Երբ',asap:'Որքան հնարավոր է շուտ',later:'Որոշակի ժամի',payment:'Վճարում',cash:'Կանխիկ',cashS:'Առաքիչին կամ դրամարկղում',card:'Քարտով՝ տերմինալով',cardS:'Առաքիչը կբերի տերմինալ',change:'Մանր պատրաստել՝',comment:'Մեկնաբանություն',commentPh:'Առանց սոխի, նախապես զանգել…',place:'Ուղարկել պատվերը',noLogin:'Առանց գրանցման։ Վճարում ստանալիս։',table:'Սեղան',yourTable:'Ձեր սեղանը',tableNote:'Պատվերը անմիջապես կհասնի մատուցողին և խոհանոց',callWaiter:'Կանչել մատուցողին',callS:'Կմոտենա սեղանին',askBill:'Խնդրել հաշիվը',billS:'Կանխիկ կամ քարտով',called:'Մատուցողն արդեն գալիս է',billAsked:'Հաշիվը բերում են',tableBill:'Պատվիրված է այս սեղանին',sendKitchen:'Ուղարկել խոհանոց',thanks:'Շնորհակալություն։ Պատվերն ընդունված է',orderN:'Պատվեր',eta:'Մոտավորապես',live:'Կարգավիճակը թարմացվում է իրական ժամանակում',myOrders:'Իմ պատվերները',featT:'Ավելին, քան ճաշացանկ։<br>Սպասարկում, որին սովորում են',f1:'Պատվեր սեղանից',f1s:'QR կոդ յուրաքանչյուր սեղանին՝ ճաշացանկ, պատվեր, մատուցողի կանչ և հաշիվ հյուրի հեռախոսում։',f2:'Առաքում և ինքնատար',f2s:'Ճշգրիտ ժամանակ, առաքման գոտիներ Կապանում, պատվերի կարգավիճակ առցանց։',f3:'Առանց գրանցման',f3s:'Անուն և հեռախոս՝ վերջ։ Վճարում կանխիկ կամ քարտով ստանալիս։',f4:'Միշտ արդիական',f4s:'Եթե ուտեստը վերջացել է, հյուրն անմիջապես տեսնում է կայքում։',bookT:'Սեղանի<br>ամրագրում',bookS:'Թողեք հայտ — ադմինիստրատորը կզանգի և կհաստատի ամրագրումը։',guests:'Հյուրեր',date:'Ամսաթիվ',time:'Ժամ',send:'Ուղարկել հայտը',bookOk:'Հայտն ուղարկված է — կզանգենք հաստատելու համար',contacts:'Կոնտակտներ',hours:'Աշխատաժամեր',daily:'Ամեն օր',addr:'ք. Կապան, Հայաստան',follow:'Սոցցանցերում',fillNP:'Նշեք անունը և հեռախոսը',fillA:'Նշեք առաքման հասցեն',added:'Ավելացված է',unavail:'ժամանակավորապես չենք ընդունում',st_new:'Ընդունված',st_cooking:'Պատրաստվում է',st_ready:'Պատրաստ է',st_readyP:'Սպասում է ձեզ',st_onway:'Առաքիչը ճանապարհին է',st_done:'Առաքված է',st_doneP:'Տրված է',st_doneT:'Մատուցված է',st_cancel:'Չեղարկված',stS_new:'Ռեստորանը ստացել է պատվերը',stS_cooking:'Շեֆն արդեն պատրաստում է',stS_ready:'Փաթեթավորում ենք',stS_onway:'Շուտով ձեզ մոտ կլինի',g:'գ',ml:'մլ',all:'Բոլորը',nothing:'Ոչինչ չգտնվեց',kitchenBusy:'Խոհանոցը ծանրաբեռնված է',repeat:'Կրկնել',closedNow:'Այժմ փակ է',opensAt:'կբացվենք',preorder:'Այժմ փակ է — ընդունում ենք նախապատվեր որոշակի ժամի',allergens:'Ալերգեններ',rate:'Գնահատեք պատվերը',rateThanks:'Շնորհակալություն կարծիքի համար',reviewPh:'Ի՞նչը դուր եկավ կամ ի՞նչ բարելավել',courier:'Առաքիչ',reason:'Պատճառ',saved:'Տվյալները պահված են այս սարքում',promoL:'Շաբաթվա առաջարկ',noOrders:'Պատվերներ դեռ չկան',open:'Բացել',sendR:'Ուղարկել կարծիքը',addedAgain:'Պատվերը կրկին զամբյուղում է',rtEyebrow:'AMORA հյուրերի վարկանիշ',rtTitle:'Եկեք հաճախ —<br><i>վճարեք պակաս</i>',rtLead:'Ձեր հեռախոսահամարով յուրաքանչյուր պատվեր բերում է միավորներ։ Ամսվա լավագույն հյուրերը ստանում են զեղչ ամբողջ հաջորդ ամսվա համար։ Առանց գրանցման և հավելվածների։',rtBoard:'Վարկանիշ',rs1:'Նշեք համարը',rs1s:'Կայքում, սեղանից կամ դրամարկղում պատվիրելիս։',rs2:'Կուտակեք միավորներ',rs2s:'1 միավոր յուրաքանչյուր {per} ֏-ի համար և +{visit}՝ յուրաքանչյուր այցի։',rs3:'Ստացեք զեղչ',rs3s:'Ամսվա թոփ-{top}-ը ստանում է զեղչ ամբողջ հաջորդ ամսվա համար՝ ավտոմատ։',rtCheck:'Իմանալ իմ տեղը',rtFind:'Ստուգել',fillPhone:'Մուտքագրեք համարը +374 XX XXX XXX ձևաչափով',rtNone:'Դեռ միավորներ չկան',rtNoneS:'Կատարեք առաջին պատվերն այս համարով, և դուք խաղի մեջ եք։',rtToNext:'Մինչև {p}-րդ տեղ՝ {n} միավոր',pts:'միավոր',rtYourDisc:'ձեր զեղչն այս ամիս',rtNoDisc:'Այս ամիս զեղչ չկա — բարձրացեք թոփ, որպեսզի ստանաք հաջորդ ամսին։',rtTg:'Հաստատել համարը Telegram-ում',rtShort:'Վարկանիշ',rtEmpty:'Այս ամսվա վարկանիշը նոր է սկսվում — եղեք առաջինը։',discL:'Վարկանիշի զեղչ',willEarn:'վարկանիշում այս պատվերի համար',tName:'Անուն (վարկանիշի համար)',tPhone:'Հեռախոս — միավորներ և զեղչ',optional:'պարտադիր չէ',tgFollow:'Հետևել պատվերին Telegram-ում',tgOn:'Կարգավիճակները կգան Telegram',svc:'Սպասարկում',tblRt:'Պատվիրելիս նշեք համարը — ստացեք միավորներ և զեղչ',qrBad:'Սեղանի կոդը հնացել է — դիմեք մատուցողին'},
en:{tag:'Restaurant · Kapan',h1:'A taste you<br><i>fall in love</i> with',lead:'Signature Armenian & European cuisine. Delivery across Kapan, pickup and ordering right from your table — no sign-up.',ctaMenu:'View menu',ctaBook:'Book a table',openUntil:'Open until',delivery:'Delivery',pickup:'Pickup',dinein:'Dine-in',min:'min',menu:'Menu',search:'Search dishes…',hit:'Bestseller',new:'New',veg:'Vegetarian',spicy:'Spicy',add:'Add',choose:'Choose',soldOut:'Sold out',cart:'Cart',yourOrder:'Your order',emptyCart:'Your cart is empty',emptySub:'Add something delicious from the menu',items:'Items',free:'free',total:'Total',toFree:'Until free delivery',minOrder:'Minimum delivery order',checkout:'Checkout',goes:'Goes well with',name:'Name',phone:'Phone',street:'Street & building',apt:'Apt / entrance / floor',zone:'Area',when:'When',asap:'As soon as possible',later:'Schedule',payment:'Payment',cash:'Cash',cashS:'To the courier or at the counter',card:'Card via terminal',cardS:'Courier brings a card terminal',change:'Change from',comment:'Note',commentPh:'No onion, call ahead…',place:'Place order',noLogin:'No sign-up. Pay on receipt.',table:'Table',yourTable:'Your table',tableNote:'Your order goes straight to the waiter and kitchen',callWaiter:'Call waiter',callS:'They will come to you',askBill:'Request the bill',billS:'Cash or card',called:'Your waiter is on the way',billAsked:'Bill is coming',tableBill:'Ordered at this table',sendKitchen:'Send to kitchen',thanks:'Thank you! Order received',orderN:'Order',eta:'Estimated',live:'Status updates live',myOrders:'My orders',featT:'More than a menu.<br>Service people get used to',f1:'Order from the table',f1s:'A QR code on every table: menu, ordering, calling the waiter and the bill — on the guest’s phone.',f2:'Delivery & pickup',f2s:'Accurate timing, delivery zones across Kapan, live order status.',f3:'No sign-up',f3s:'Name and phone — that’s it. Pay cash or card on receipt.',f4:'Always up to date',f4s:'If a dish is sold out, guests see it on the site instantly.',bookT:'Reserve<br>a table',bookS:'Leave a request — our host will call you to confirm.',guests:'Guests',date:'Date',time:'Time',send:'Send request',bookOk:'Request sent — we will call you to confirm',contacts:'Contacts',hours:'Hours',daily:'Daily',addr:'Kapan, Armenia',follow:'Follow us',fillNP:'Enter your name and phone',fillA:'Enter the delivery address',added:'Added',unavail:'temporarily unavailable',st_new:'Received',st_cooking:'Cooking',st_ready:'Ready',st_readyP:'Waiting for you',st_onway:'Courier on the way',st_done:'Delivered',st_doneP:'Picked up',st_doneT:'Served',st_cancel:'Cancelled',stS_new:'The restaurant got your order',stS_cooking:'The chef is on it',stS_ready:'Packing it up',stS_onway:'Almost there',g:'g',ml:'ml',all:'All',nothing:'Nothing found',kitchenBusy:'Kitchen is busy',repeat:'Repeat',closedNow:'Closed now',opensAt:'opens at',preorder:'We are closed — pre-orders for a set time are open',allergens:'Allergens',rate:'Rate your order',rateThanks:'Thanks for your feedback!',reviewPh:'What did you like or what to improve?',courier:'Courier',reason:'Reason',saved:'Details saved on this device',promoL:'Offer of the week',noOrders:'No orders yet',open:'Open',sendR:'Send feedback',addedAgain:'Order is back in the cart',rtEyebrow:'AMORA guest ranking',rtTitle:'Come more often —<br><i>pay less</i>',rtLead:'Every order with your phone number earns points. The month’s top guests get a discount for the whole next month. No sign-up, no apps.',rtBoard:'Ranking',rs1:'Give your number',rs1s:'When ordering online, at the table or at the counter.',rs2:'Collect points',rs2s:'1 point per {per} ֏ and +{visit} for every visit.',rs3:'Get a discount',rs3s:'The month’s top {top} get a discount for the whole next month — applied automatically.',rtCheck:'Check your place',rtFind:'Check',fillPhone:'Enter a number like +374 XX XXX XXX',rtNone:'No points yet',rtNoneS:'Place your first order with this number and you’re in.',rtToNext:'{n} points to reach #{p}',pts:'points',rtYourDisc:'your discount this month',rtNoDisc:'No discount this month — climb into the top to get one next month.',rtTg:'Verify number in Telegram',rtShort:'Ranking',rtEmpty:'This month’s ranking is just starting — be the first!',discL:'Ranking discount',willEarn:'to your ranking for this order',tName:'Name (for ranking)',tPhone:'Phone — points & discount',optional:'optional',tgFollow:'Track order in Telegram',tgOn:'Updates will come to Telegram',svc:'Service charge',tblRt:'Add your number when ordering to earn points and discounts',qrBad:'This table code is outdated — please ask the waiter'}
};

/* ================= STORE ================= */

const T4={
ru:{tag:'Кафе · бар · лаунж · Капан',lead:'Хачапури, пицца, паста, горячие блюда и закуски — в зале, с доставкой по Капану или на самовывоз. Заказ без регистрации.',addr:'Капан, ул. Р. Меликяна 6/6',nBook:'Бронь',howE:'Как заказать',howT:'Три способа<br><i>попробовать AMORA</i>',w1:'В зале',w1s:'Отсканируйте QR-код на столе: меню, заказ, вызов официанта и счёт — в вашем телефоне.',w2s:'По Капану. Оплата наличными или картой через терминал курьера. Статус заказа — онлайн.',w3s:'Закажите заранее и заберите к удобному времени — без очереди.',dzT:'Условия доставки',dzFee:'Стоимость',dzFrom:'Бесплатно от',dzTime:'Время',orderNow:'Заказать',ctE:'Контакты',ctT:'Ждём вас<br><i>в AMORA</i>',call:'Позвонить',route:'Маршрут',insta:'Instagram',bkNote:'Пожелания',bkNoteP:'Повод, детский стул, место у окна…',bkDone:'Заявка отправлена',bkDoneS:'Администратор перезвонит и подтвердит бронь. Если срочно — позвоните нам.',bkAgain:'Новая заявка',bkPast:'Выберите дату и время в будущем',prev:'Предыдущее блюдо',next:'Следующее блюдо',pause:'Остановить показ',play:'Продолжить показ',navOpen:'Меню сайта',adrL:'Адрес',rights:'Все права защищены',skip:'Пропустить',onMenu:'в меню',dzOff:'временно не работает'},
hy:{tag:'Սրճարան · բար · լաունջ · Կապան',lead:'Խաչապուրի, պիցցա, մակարոնեղեն, տաք ուտեստներ և նախուտեստներ՝ սրահում, առաքմամբ Կապանում կամ ինքնատարով։ Պատվեր՝ առանց գրանցման։',addr:'Կապան, Ռ. Մելիքյան 6/6',nBook:'Ամրագրում',howE:'Ինչպես պատվիրել',howT:'Երեք եղանակ<br><i>համտեսելու AMORA-ն</i>',w1:'Սրահում',w1s:'Սկանավորեք սեղանի QR կոդը՝ ճաշացանկ, պատվեր, մատուցողի կանչ և հաշիվ ձեր հեռախոսում։',w2s:'Կապանում։ Վճարում՝ կանխիկ կամ քարտով՝ առաքիչի տերմինալով։ Պատվերի կարգավիճակը՝ առցանց։',w3s:'Պատվիրեք նախապես և վերցրեք Ձեզ հարմար ժամին՝ առանց հերթի։',dzT:'Առաքման պայմաններ',dzFee:'Արժեք',dzFrom:'Անվճար՝ սկսած',dzTime:'Ժամանակ',orderNow:'Պատվիրել',ctE:'Կոնտակտներ',ctT:'Սպասում ենք Ձեզ<br><i>AMORA-ում</i>',call:'Զանգել',route:'Երթուղի',insta:'Instagram',bkNote:'Ցանկություններ',bkNoteP:'Առիթ, մանկական աթոռ, տեղ պատուհանի մոտ…',bkDone:'Հայտն ուղարկված է',bkDoneS:'Ադմինիստրատորը կզանգի և կհաստատի ամրագրումը։ Եթե շտապ է՝ զանգահարեք մեզ։',bkAgain:'Նոր հայտ',bkPast:'Ընտրեք ապագա ամսաթիվ և ժամ',prev:'Նախորդ ուտեստը',next:'Հաջորդ ուտեստը',pause:'Կանգնեցնել ցուցադրումը',play:'Շարունակել ցուցադրումը',navOpen:'Կայքի ընտրացանկ',adrL:'Հասցե',rights:'Բոլոր իրավունքները պաշտպանված են',skip:'Բաց թողնել',onMenu:'ճաշացանկում',dzOff:'ժամանակավորապես չի գործում'},
en:{tag:'Café · bar · lounge · Kapan',lead:'Khachapuri, pizza, pasta, mains and starters — dine in, delivered across Kapan, or picked up. Order without signing up.',addr:'R. Melikyan 6/6, Kapan',nBook:'Reservations',howE:'How to order',howT:'Three ways<br><i>to taste AMORA</i>',w1:'Dine in',w1s:'Scan the QR code on your table: menu, ordering, calling the waiter and the bill — on your phone.',w2s:'Across Kapan. Pay cash or by card via the courier’s terminal. Track your order live.',w3s:'Order ahead and collect at a time that suits you — no queue.',dzT:'Delivery terms',dzFee:'Fee',dzFrom:'Free from',dzTime:'Time',orderNow:'Order',ctE:'Contacts',ctT:'See you<br><i>at AMORA</i>',call:'Call',route:'Directions',insta:'Instagram',bkNote:'Requests',bkNoteP:'Occasion, high chair, window seat…',bkDone:'Request sent',bkDoneS:'Our host will call you back to confirm. In a hurry? Give us a call.',bkAgain:'New request',bkPast:'Pick a date and time in the future',prev:'Previous dish',next:'Next dish',pause:'Pause slideshow',play:'Play slideshow',navOpen:'Site menu',adrL:'Address',rights:'All rights reserved',skip:'Skip',onMenu:'on the menu',dzOff:'temporarily unavailable'}};
T4.ru.st_new='Получен';T4.ru.stS_ready='Заказ готов';T4.hy.stS_ready='Պատվերը պատրաստ է';T4.en.stS_ready='Your order is ready';T4.hy.st_new='Ստացված է';T4.ru.st_accepted='Принят';T4.ru.stS_accepted='Ресторан подтвердил заказ';T4.hy.st_accepted='Ընդունված է';T4.hy.stS_accepted='Ռեստորանը հաստատել է պատվերը';T4.en.st_accepted='Accepted';T4.en.stS_accepted='The restaurant confirmed your order';
Object.assign(T4.ru,{madeBy:'Сайт создан',pv:['Оформляя заказ или бронь на сайте, вы сообщаете нам имя, номер телефона и, при доставке, адрес.','Эти данные используются только для выполнения заказа, связи с вами и расчёта рейтинга гостя (скидок). Мы не продаём и не передаём их третьим лицам.','Данные хранятся на защищённом сервере и доступны только сотрудникам AMORA. Сайт не использует рекламные cookie.','Чтобы удалить или изменить свои данные, позвоните +374 94 410 140.'],seoTitle:'AMORA — ресторан, кафе и бар в Капане · доставка еды',seoText:'AMORA — кафе, бар и лаунж в Капане, ул. Р. Меликяна 6/6. Завтраки, бизнес-ланчи, хачапури, пицца, паста, горячие блюда, десерты, кофе и коктейли. Доставка еды по Капану, самовывоз, бронь столика и заказ со стола по QR.',privacy:'Политика конфиденциальности',barEmpty:'Барная карта скоро появится на сайте. Напитки можно заказать у официанта.',book:'Бронь столика',onsite:'Оплата в ресторане',preT:'Предзаказ блюд к приходу',preS:'приготовим к вашему времени',preEmpty:'Выберите блюда заранее — они будут готовы к вашему приходу.',preBtn:'Выбрать блюда',preEdit:'Изменить',preHint:'Добавьте блюда в корзину и вернитесь к брони',preCart:'Предзаказ к брони столика',preOk:'Предзаказ',preOkS:'Блюда будут готовы к вашему приходу. Оплата в ресторане.',});
Object.assign(T4.hy,{madeBy:'Կայքը ստեղծվել է',pv:['Կայքի միջոցով պատվեր կամ ամրագրում կատարելիս մենք ստանում ենք Ձեր անունը, հեռախոսահամարը և, առաքման դեպքում, հասցեն։','Այս տվյալներն օգտագործվում են միայն պատվերը կատարելու, Ձեզ հետ կապվելու և հավատարմության վարկանիշը (զեղչերը) հաշվելու համար։ Մենք դրանք չենք վաճառում և չենք փոխանցում երրորդ անձանց։','Տվյալները պահվում են պաշտպանված սերվերում և հասանելի են միայն AMORA-ի աշխատակիցներին։ Կայքը չի օգտագործում գովազդային cookie-ներ։','Տվյալները ջնջելու կամ փոփոխելու համար զանգահարեք +374 94 410 140։'],seoTitle:'AMORA — ռեստորան, սրճարան և բար Կապանում · սննդի առաքում',seoText:'AMORA — սրճարան, բար և լաունջ Կապանում, Ռ. Մելիքյան 6/6։ Նախաճաշեր, լանչեր, խաչապուրի, պիցցա, մակարոնեղեն, տաք ուտեստներ, աղանդեր, սուրճ և կոկտեյլներ։ Սննդի առաքում Կապանում, ինքնատար, սեղանի ամրագրում և պատվեր QR կոդով։',privacy:'Գաղտնիության քաղաքականություն',barEmpty:'Բարային քարտը շուտով կհայտնվի կայքում։ Ըմպելիքները կարող եք պատվիրել մատուցողից։',book:'Սեղանի ամրագրում',onsite:'Վճարում ռեստորանում',preT:'Ուտեստների նախապատվեր',preS:'կպատրաստենք Ձեր ժամին',preEmpty:'Ընտրեք ուտեստները նախապես՝ դրանք պատրաստ կլինեն Ձեր գալու պահին։',preBtn:'Ընտրել ուտեստներ',preEdit:'Փոխել',preHint:'Ավելացրեք ուտեստներ զամբյուղ և վերադարձեք ամրագրմանը',preCart:'Նախապատվեր ամրագրման համար',preOk:'Նախապատվեր',preOkS:'Ուտեստները պատրաստ կլինեն Ձեր գալու պահին։ Վճարումը՝ ռեստորանում։'});
Object.assign(T4.en,{madeBy:'Website by',pv:['When you place an order or a reservation on this website you provide your name, phone number and, for delivery, your address.','This data is used only to fulfil your order, contact you and calculate your guest rating (discounts). We do not sell it or share it with third parties.','The data is stored on a secure server and is accessible only to AMORA staff. The website does not use advertising cookies.','To delete or change your data, call +374 94 410 140.'],seoTitle:'AMORA — restaurant, café & bar in Kapan · food delivery',seoText:'AMORA is a café, bar and lounge in Kapan, Armenia (R. Melikyan 6/6). Breakfasts, lunches, khachapuri, pizza, pasta, mains, desserts, coffee and cocktails. Food delivery in Kapan, pickup, table reservations and QR ordering at the table.',privacy:'Privacy policy',barEmpty:'The bar menu will appear on the site soon. Drinks can be ordered from your waiter.',book:'Table reservation',onsite:'Pay at the restaurant',preT:'Pre-order dishes',preS:'ready when you arrive',preEmpty:'Choose dishes in advance — they will be ready when you arrive.',preBtn:'Choose dishes',preEdit:'Edit',preHint:'Add dishes to your cart, then come back to the reservation',preCart:'Pre-order with a reservation',preOk:'Pre-order',preOkS:'Your dishes will be ready when you arrive. Pay at the restaurant.'});
['ru','hy','en'].forEach(l=>Object.assign(T[l],T4[l]));
const CONTACT=Object.assign({phone:'+374 94 410 140',email:'',instagram:'amora.cafe.lounge',mapUrl:'https://maps.google.com/?cid=8388215835638994954'},CFG.contact||{});
const TEL='tel:'+CONTACT.phone.replace(/[^\d+]/g,'');
const MAILTO='mailto:'+CONTACT.email;
const MAPURL=CONTACT.mapUrl||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('AMORA café, R. Melikyan 6/6, Kapan, Armenia');
const IGURL='https://www.instagram.com/'+CONTACT.instagram+'/';
const HERO_SLIDES=['adjarian-khachapuri','pepperoni','beef-brasato-with-barberries','greek-salad','halibut-steak-with-sauteed-vegetables','tolma','tuna-tataki','pork-ribs'];
const HERO_MS=5000;let heroI=0,heroTm=null,heroHover=false,heroUserPaused=false;
const RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const IC={arrowL:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg>',arrowR:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg>',pause:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',play:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>',pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',phone:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',ig:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',clock:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',table:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/></svg>',bike:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-7h5l3 7M10 10 8 6H5M15 10l1-3h3"/></svg>',bag:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'};
const KEY=ENTRY==='demo'?'amora-demo-v5':'amora-site-v1',LKEY='amora-local-v5';
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
let bc=null;try{bc=new BroadcastChannel(KEY)}catch(e){}
const now=()=>Date.now();
const snap=id=>({...DMAP[id].n});
function seedBase(){
  const t=now();
  const mk=(n,type,items,extra,status,ago,rv)=>{const its=items.map(([id,q,oi,add])=>({id,q,p:BMAP[id].p+(add||0),n:{...BMAP[id].n},o:oi?[oi]:[],oi:{}}));const sub=its.reduce((s,i)=>s+i.p*i.q,0);const fee=type==='delivery'?500:0;const o=Object.assign({id:'o'+n,n,type,items:its,sub,fee,total:sub+fee,status,ts:t-ago*60000,hist:{new:t-ago*60000,cooking:t-(ago-3)*60000},pay:'cash'},extra);if(status==='done'){o.paid=true;o.payM=o.pay;o.paidAt=o.ts+40*60000;o.hist.accepted=o.ts+60000;o.hist.done=o.ts+40*60000}if(rv){o.rating=rv[0];o.review=rv[1]}return o};
  return {seq:108,menu:Object.fromEntries(BASE.map(d=>[d.id,{avail:true,p:d.p}])),added:[],
    settings:{delivery:true,pickup:true,tables:true,extra:0,minOrder:5000,freeFrom:15000,open:'11:00',close:'00:00',tablesN:12,svc:10,repeat:true,couriers:ENTRY==='demo'?['Арман','Сурен','Гор']:[],
      promo:{on:false,ru:'',hy:'',en:''},
      zones:[{id:'c',ru:'Центр',hy:'Կենտրոն',en:'Center',fee:500},{id:'d',ru:'Городские районы',hy:'Քաղաքի թաղամասեր',en:'City districts',fee:800},{id:'s',ru:'Пригород',hy:'Արվարձաններ',en:'Suburbs',fee:1500}]},
    orders:[
      mk(101,'delivery',[['fried-potatoes-with-pork',2],['greek-salad',1]],{name:'Арам',phone:'+374 77 12 34 56',street:'ул. Шаумяна 12',apt:'кв. 8',zone:'c',courier:'Арман'},'done',210,[5,'Картошку со свининой привезли горячей, очень вкусно!']),
      mk(102,'table',[['beef-brasato-with-barberries',1],['carbonara-pasta',1],['pumpkin-cream-soup',2]],{table:4},'done',160,[5,'Бразато — лучшее блюдо в Капане']),
      mk(103,'pickup',[['pepperoni',2],['4-cheese',1]],{name:'Гость',phone:'+374 93 00 00 01'},'done',120,[4,'Пицца отличная, чуть подождали']),
      mk(104,'table',[['tolma',2],['caesar-salad',1],['adjarian-khachapuri',2]],{table:7},'done',95,[5,'Толма как у бабушки']),
      mk(105,'delivery',[['crispy-chicken-wings',2,L3('6 шт','6 հատ','6 pcs')],['french-fries',1],['tuna-tataki',1]],{name:'Давид',phone:'+374 55 10 20 30',street:'ул. Гарегина Нжде 5',apt:'',zone:'d',pay:'card',courier:'Сурен'},'done',70),
      mk(106,'delivery',[['schnitzel-with-potatoes',1],['chicken-salad',1],['cream-of-mushroom-soup',2]],{name:'Ани',phone:'+374 91 40 50 60',street:'ул. Абовяна 3',apt:'кв. 21, 4 этаж',zone:'c',courier:'Гор'},'onway',38),
      mk(107,'table',[['pesto',1],['pantaso',1],['bruschetta',1]],{table:3},'cooking',14),
    ],
    calls:[],bookings:[{id:'b1',name:'Гаяне',phone:'+374 98 11 22 33',date:new Date(t+864e5).toISOString().slice(0,10),time:'19:30',guests:6,status:'new',ts:t-3e6}]};
}
function seed(){const s=seedBase();
  s.settings.loyalty={on:true,per:100,visit:20,tiers:[{from:1,to:1,pct:15},{from:2,to:3,pct:10},{from:4,to:10,pct:7},{from:11,to:25,pct:5}]};
  s.staff=[{id:'u1',name:'Администратор',role:'admin',pin:'1234'},{id:'u2',name:'Официант Марине',role:'waiter',pin:'1111'},{id:'u3',name:'Повар Гор',role:'kitchen',pin:'2222'},{id:'u6',name:'Бармен Давид',role:'bar',pin:'5555'},{id:'u4',name:'Курьер Арман',role:'courier',pin:'3333'},{id:'u5',name:'Менеджер Анна',role:'manager',pin:'4444'}];
  s.tables={};for(let i=1;i<=40;i++)s.tables[i]=(rnd('k'+i)()*1e9|0).toString(36).slice(0,6);
  s.tg=[];seedCustomers(s);
  s.orders.forEach(o=>{if(o.status==='done'&&o.phone)o.awarded=Math.floor(o.total/100)+20});
  return s}
function blank(){const s=seed();s.orders=[];s.calls=[];s.bookings=[];s.customers={};s.tg=[];s.staff=[];s.seq=100;s.added=[];s.tables={};Object.values(s.menu).forEach(m=>m.avail=true);return s}
function rebuild(){
  const m=S.menu||{};const pals=[['#7a3a22','#c9874a','#5f8a37'],['#c8442e','#f0d9a0','#4f8a35'],['#e3cf9a','#9a6a3f','#5c8a37']];
  const all=[...BASE,...(S.added||[]).map((a,i)=>({...a,pal:a.pal||pals[i%3],opts:null,alg:a.alg||[]}))];
  DISHES=all.map(b=>{const o=m[b.id]||{};return {...b,...o,n:o.n||b.n,d:o.d||b.d,p:o.p??b.p,avail:o.avail!==false&&!o.deleted,hidden:!!o.hidden||!!o.deleted,deleted:!!o.deleted,dep:catDep(o.c||b.c)}});
  DMAP=Object.fromEntries(DISHES.map(d=>[d.id,d]));
}
function clean(){const s=seed();s.orders=[];s.calls=[];s.bookings=[];s.customers={};s.tg=[];s.seq=100;return s}
let S=LIVE?blank():(ls.get(KEY)||(ENTRY==='demo'?seed():clean()));rebuild();
const URLLANG=(new URLSearchParams(location.search).get('lang')||'').toLowerCase();
const L=Object.assign({lang:(()=>{const n=(navigator.language||'').toLowerCase();return n.startsWith('hy')?'hy':/^(ru|uk|be|kk)/.test(n)?'ru':n?'en':'ru'})(),cart:{},my:[],prof:{}},ls.get(LKEY)||{});if(['hy','ru','en'].includes(URLLANG))L.lang=URLLANG;
if(Object.values(L.cart).some(v=>typeof v!=='object'))L.cart={};
function saveL(){ls.set(LKEY,L)}
function commit(silent){rebuild();if(LIVE){if(BK)BK.sync(S)}else{if(!ls.set(KEY,S))toast('Память браузера заполнена — фото не сохранится после перезагрузки');if(bc)bc.postMessage(S)}if(!silent)renderAll()}
function onRemote(next){const before=new Set(S.orders.map(o=>o.id));const bc0=S.calls.filter(c=>!c.done).length;S=next;rebuild();
  const fresh=S.orders.filter(o=>!before.has(o.id));const nc=S.calls.filter(c=>!c.done).length>bc0;
  if(view.mode==='staff'&&document.activeElement&&document.activeElement.matches('input,textarea,select'))return;
  renderAll()}
if(bc&&!LIVE)bc.onmessage=e=>onRemote(e.data);
window.addEventListener('storage',e=>{if(!LIVE&&e.key===KEY&&e.newValue){try{onRemote(JSON.parse(e.newValue))}catch(_){}}});

/* ================= HELPERS ================= */
const t=k=>(T[L.lang]&&T[L.lang][k])||T.ru[k]||k;
const nm=o=>o?(o[L.lang]||o.ru):'';
const fmt=n=>Math.round(n).toLocaleString('ru-RU').replace(/ /g,' ')+' ֏';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=id=>DMAP[id]?DMAP[id].p:0;
const avail=id=>!!DMAP[id]&&DMAP[id].avail&&!DMAP[id].hidden;
const $=s=>document.querySelector(s);
const hm=ts=>new Date(ts).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
function toast(msg,cls){const el=document.createElement('div');el.className='toast '+(cls||'');el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>{el.style.transition='.4s';el.style.opacity=0;setTimeout(()=>el.remove(),400)},2600)}
let actx=null;function ding(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.currentTime;[[880,0],[1320,.16],[1760,.32]].forEach(([f,d])=>{const g=actx.createGain(),s=actx.createOscillator();s.type='sine';s.frequency.value=f;g.gain.setValueAtTime(0,o+d);g.gain.linearRampToValueAtTime(.22,o+d+.02);g.gain.exponentialRampToValueAtTime(.001,o+d+.5);s.connect(g).connect(actx.destination);s.start(o+d);s.stop(o+d+.55)})}catch(e){}}
function rnd(seed){let s=7;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
const toMin=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return h*60+(m||0)};
function isOpen(){const n=new Date(),c=n.getHours()*60+n.getMinutes(),o=toMin(S.settings.open),cl=toMin(S.settings.close);return cl>o?(c>=o&&c<cl):(c>=o||c<cl)}
let artN=0;
// Заглушка для напитков без фото: силуэт посуды по категории (чашка, бокал, шот…), без «тарелок»
function drinkArt(d){const c=d.c,a=d.pal[0],u='g'+(artN++);const G='#CBA662';
  const shapes={coffee:`<path d="M58 70h70v34a30 30 0 0 1-30 30h-10a30 30 0 0 1-30-30z"/><path d="M128 80h10a12 12 0 0 1 0 24h-12"/><path d="M48 142h100"/><path d="M80 44c-6 8 6 12 0 20M98 40c-6 8 6 12 0 20"/>`,
    tea:`<path d="M54 74h78v30a32 32 0 0 1-32 32h-14a32 32 0 0 1-32-32z"/><path d="M132 84h8a11 11 0 0 1 0 22h-10"/><path d="M46 144h104"/><path d="M93 74V52m0 0h14v12h-14"/>`,
    cocktail:`<path d="M52 52h96l-48 52z"/><path d="M100 104v42M78 150h44"/><circle cx="132" cy="48" r="9"/><path d="M118 38l22-14"/>`,
    mocktail:`<path d="M66 44h68l-8 104H74z"/><path d="M70 72h60"/><path d="M112 30l-6 60"/><circle cx="124" cy="46" r="8"/>`,
    shots:`<path d="M76 70h48l-6 72H82z"/><path d="M78 92h44"/>`,
    lemonade:`<path d="M64 44h72l-6 104H70z"/><path d="M68 70h64"/><circle cx="86" cy="96" r="8"/><circle cx="110" cy="116" r="6"/><path d="M118 28l-8 70"/>`,
    juice:`<path d="M66 50h68l-6 98H72z"/><path d="M70 78h60"/><path d="M114 34l-6 50"/>`,
    soft:`<path d="M86 34h28v12l8 14v84a6 6 0 0 1-6 6H84a6 6 0 0 1-6-6V60l8-14z"/><path d="M78 84h44"/>`,
    beer:`<path d="M62 56h60v86a8 8 0 0 1-8 8H70a8 8 0 0 1-8-8z"/><path d="M122 74h12a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-12"/><path d="M62 56c4-12 14-14 22-10 6-10 22-10 28 0 8-4 14 2 10 10"/><path d="M80 80v54M102 80v54"/>`,
    wine:`<path d="M72 36h56c2 30-6 56-28 60-22-4-30-30-28-60z"/><path d="M75 64h50"/><path d="M100 96v46M80 148h40"/>`,
    cognac:`<path d="M66 60c-10 36 4 66 34 68 30-2 44-32 34-68z"/><path d="M68 98h64"/><path d="M100 128v16M80 150h40"/>`,
    vodka:`<path d="M78 66h44l-6 76H84z"/><path d="M80 96h40"/>`,
    spirits:`<path d="M62 74h76l-6 70H68z"/><path d="M64 104h72"/><rect x="80" y="84" width="16" height="16" rx="3"/><rect x="102" y="90" width="14" height="14" rx="3"/>`,
    beersnacks:`<path d="M44 92h112c-4 34-26 52-56 52s-52-18-56-52z"/><circle cx="78" cy="82" r="10"/><circle cx="100" cy="76" r="11"/><circle cx="122" cy="82" r="10"/>`,
    desserts:`<path d="M46 120l108-40v40z"/><path d="M46 120v22h108v-22"/><path d="M46 131h108"/><circle cx="128" cy="76" r="9"/><path d="M128 67c2-8 8-10 12-8"/>`,
    yogurt:`<path d="M58 70h84l-10 70H68z"/><path d="M56 70c6-16 18-24 44-24s38 8 44 24"/><circle cx="90" cy="56" r="5"/><circle cx="108" cy="52" r="4"/>`};
  return `<svg class="ph art drink" viewBox="0 0 200 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(nm(d.n))}"><defs><radialGradient id="${u}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${a}" stop-opacity=".35"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient></defs><rect width="200" height="180" fill="#151310"/><circle cx="100" cy="98" r="78" fill="url(#${u})"/><g fill="none" stroke="${G}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${shapes[c]||shapes.mocktail}</g></svg>`}
function art(d,noImg,big){if(d.img&&!noImg)return `<img class="ph" src="${d.img}" alt="${esc(nm(d.n))}" loading="lazy">`;
  if(d.photo&&!noImg)return `<img class="ph" src="${d.photo}-sm.webp" srcset="${d.photo}-sm.webp 480w, ${d.photo}.webp 1080w" sizes="${big?'(max-width:760px) 100vw, 560px':'(max-width:760px) 120px, 400px'}" alt="${esc(nm(d.n))}" loading="lazy" decoding="async" onerror="this.outerHTML=fbArt('${d.id}')">`;
  if((d.dep||catDep(d.c))==='bar')return drinkArt(d);
  const r=rnd(d.id),[c1,c2,c3]=d.pal,u='a'+(artN++),sd=Math.floor(r()*99);
  const defs=`<filter id="${u}t" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${sd}"/><feDisplacementMap in="SourceGraphic" scale="8"/></filter><radialGradient id="${u}r" cx=".42" cy=".36"><stop offset=".55" stop-color="#f6f0e6"/><stop offset=".86" stop-color="#e3dacb"/><stop offset="1" stop-color="#c4b9a6"/></radialGradient><radialGradient id="${u}h" cx=".35" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  if(d.c==='drinks'){return `<svg viewBox="0 0 200 200"><defs>${defs}<radialGradient id="${u}l" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="${c3}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs><circle cx="100" cy="100" r="86" fill="url(#${u}r)"/><circle cx="100" cy="100" r="60" fill="rgba(255,255,255,.35)" stroke="rgba(255,255,255,.9)" stroke-width="3"/><circle cx="100" cy="100" r="53" fill="url(#${u}l)"/><circle cx="100" cy="100" r="53" fill="url(#${u}h)"/>${d.id==='lemonade'?'<circle cx="120" cy="112" r="12" fill="#c8e68a" stroke="#6f9a3a" stroke-width="2"/><path d="M120 100v24M108 112h24" stroke="#6f9a3a" stroke-width="1"/><path d="M84 118 q8 -16 22 -8" stroke="#3f7a2c" stroke-width="5" fill="none" stroke-linecap="round"/>':d.id==='orange'?'<circle cx="122" cy="84" r="14" fill="#f6a43a" stroke="#fde3b0" stroke-width="2.5"/>':'<ellipse cx="100" cy="100" rx="26" ry="24" fill="rgba(199,155,106,.55)"/><ellipse cx="94" cy="94" rx="10" ry="6" fill="rgba(255,240,220,.35)"/>'}<ellipse cx="80" cy="76" rx="18" ry="6" fill="rgba(255,255,255,.4)" transform="rotate(-35 80 76)"/></svg>`}
  let food='';const cx=100,cy=100;
  if(d.c==='pizza'){food=`<circle cx="100" cy="100" r="60" fill="#c98e4c"/><circle cx="100" cy="100" r="56" fill="#dca965"/><g filter="url(#${u}t)"><circle cx="100" cy="100" r="49" fill="${c1}"/>`;for(let i=0;i<10;i++){const a=r()*6.28,rr=r()*38;food+=`<circle cx="${cx+Math.cos(a)*rr}" cy="${cy+Math.sin(a)*rr}" r="${5+r()*6}" fill="${c2}" opacity=".95"/>`}food+='</g>';for(let i=0;i<9;i++){const a=r()*6.28,rr=r()*40;food+=`<ellipse cx="${cx+Math.cos(a)*rr}" cy="${cy+Math.sin(a)*rr}" rx="${3+r()*3}" ry="${2+r()*2}" fill="${c3}" transform="rotate(${r()*180} ${cx+Math.cos(a)*rr} ${cy+Math.sin(a)*rr})"/>`}for(let i=0;i<6;i++){const a=i*1.047;food+=`<line x1="100" y1="100" x2="${100+Math.cos(a)*58}" y2="${100+Math.sin(a)*58}" stroke="rgba(60,30,10,.28)" stroke-width="1.2"/>`}food+=`<circle cx="100" cy="100" r="58" fill="url(#${u}h)"/>`}
  else{const rx=30+r()*14,ry=24+r()*12,rot=r()*180;
    food=`<path d="M${58+r()*10} ${132+r()*8} q40 ${10+r()*10} ${84} -${30+r()*20}" stroke="${shade(c2,.75)}" stroke-width="${7+r()*4}" fill="none" stroke-linecap="round" opacity=".5" filter="url(#${u}t)"/>`;
    for(let i=0;i<5;i++){const a=r()*6.28;food+=`<circle cx="${cx+Math.cos(a)*54}" cy="${cy+Math.sin(a)*54}" r="${1.6+r()*1.6}" fill="${shade(c2,.8)}" opacity=".7"/>`}
    food+=`<g filter="url(#${u}t)"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} 100 100)" fill="${shade(c1,1.1)}"/>`;
    const n=4+Math.floor(r()*4);for(let i=0;i<n;i++){const a=r()*6.28,rr=8+r()*24;food+=`<circle cx="${cx+Math.cos(a)*rr}" cy="${cy+Math.sin(a)*rr}" r="${5+r()*8}" fill="${i%2?c2:shade(c1,1.3)}"/>`}food+='</g>';
    food+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} 100 100)" fill="url(#${u}h)"/>`;
    for(let i=0;i<9;i++){const a=r()*6.28,rr=10+r()*32;food+=`<circle cx="${cx+Math.cos(a)*rr}" cy="${cy+Math.sin(a)*rr}" r="${1.4+r()*2.6}" fill="${c3}"/>`}
    for(let i=0;i<4;i++){const a=r()*6.28,rr=18+r()*20,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;food+=`<path d="M${x} ${y} q3 -8 10 -3 q-5 1 -10 3z" fill="#5f8a37"/>`}}
  return `<svg viewBox="0 0 200 200"><defs>${defs}</defs><circle cx="100" cy="100" r="90" fill="url(#${u}r)"/><circle cx="100" cy="100" r="67" fill="#f8f3eb"/><circle cx="100" cy="100" r="67" fill="none" stroke="rgba(120,100,70,.12)" stroke-width="3"/>${food}</svg>`}
const A=(id,big)=>DMAP[id]?art(DMAP[id],false,big):'';
function fbArt(id){return DMAP[id]?art(DMAP[id],true):''}

/* ================= VIEW STATE ================= */
const view={flash:new Set(),side:false,hlim:100,mode:'guest',table:null,cat:null,q:'',filters:new Set(),drawer:null,step:'cart',ctype:'delivery',
  form:Object.assign({name:'',phone:'',street:'',apt:'',zone:'c',when:'asap',time:'',pay:'cash',change:'',note:''},L.prof||{}),
  trackId:null,sheet:null,sheetQty:1,sheetOpts:{},staffTab:'orders',rej:null,smodal:null,rate:{},rateTxt:{},tour:null,tourMin:false,edit:null};
let staffAuthed=false,pin='',staffUser=null;
function route(){const h=location.hash.replace('#','');
  if(ENTRY==='admin'){view.mode='staff'}
  else if(h==='staff'&&ENTRY==='demo'){view.mode='staff'}
  else if(/^table-\d+/.test(h)){const p=h.split('-');view.mode='table';view.table=+p[1];view.tkey=p[2]||'';view.ctype='table'}
  else{view.mode='guest';view.table=null;if(view.ctype==='table')view.ctype='delivery'}
  closeAll();renderAll();window.scrollTo(0,0)}
window.addEventListener('hashchange',route);
function go(h){if(location.hash==='#'+h||(h===''&&!location.hash)){route()}else location.hash=h}

/* ================= CART ================= */
const keyOf=(id,o)=>id+'|'+Object.keys(o||{}).sort().map(k=>k+':'+o[k]).join(',');
const cartList=()=>Object.entries(L.cart).filter(([,l])=>l&&l.q>0&&DMAP[l.id]);
const cartCount=()=>cartList().reduce((s,[,l])=>s+l.q,0);
const optSel=l=>(DMAP[l.id].opts||[]).map(g=>g.ch[l.o?.[g.id]??0]).filter(Boolean);
const lineUnit=l=>price(l.id)+optSel(l).reduce((s,c)=>s+(c.p||0),0);
const cartSub=()=>cartList().reduce((s,[,l])=>s+lineUnit(l)*l.q,0);
const qtyOf=id=>cartList().filter(([,l])=>l.id===id).reduce((s,[,l])=>s+l.q,0);
function defOpts(id){const o={};(DMAP[id].opts||[]).forEach(g=>o[g.id]=0);return o}
function addCart(id,q=1,o){if(!avail(id))return;o=o||defOpts(id);const k=keyOf(id,o);const l=L.cart[k]||{id,q:0,o};l.q+=q;if(l.q<=0)delete L.cart[k];else L.cart[k]=l;saveL();renderGuestBits()}
function bumpKey(k,q){const l=L.cart[k];if(!l)return;l.q+=q;if(l.q<=0)delete L.cart[k];saveL();renderGuestBits()}
function zoneFee(){const z=S.settings.zones.find(z=>z.id===view.form.zone)||S.settings.zones[0];return z.fee}
const svcPct=()=>Math.max(0,Math.min(30,+(S.settings.svc??10)||0));const svcOf=a=>Math.round(a*svcPct()/100);
function fee(){if(view.ctype!=='delivery')return 0;return cartSub()>=S.settings.freeFrom?0:zoneFee()}
function etaMin(type){return ({delivery:45,pickup:20,table:15,book:15}[type]||15)+(+S.settings.extra||0)}
const itemName=(it,lang)=>{const l=lang||L.lang;return (it.n[l]||it.n.ru)+(it.o&&it.o.length?' · '+it.o.map(x=>x[l]||x.ru).join(', '):'')};

/* ================= RENDER: GUEST ================= */
function navItems(){const lo=S.settings.loyalty&&S.settings.loyalty.on;return [['mnav',t('menu')],['deliv',t('delivery')],...(lo?[['rating',t('rtShort')]]:[]),['book',t('nBook')],['contacts',t('contacts')]]}
function renderGuest(){
  const app=$('#app');const st=S.settings;const tbl=view.mode==='table';const open=isOpen();
  const active=L.my.map(id=>S.orders.find(o=>o.id===id)).filter(o=>o&&!['done','cancel'].includes(o.status));
  const myCalls=tbl?S.calls.filter(c=>c.table===view.table&&!c.done):[];
  const lo=S.settings.loyalty&&S.settings.loyalty.on;
  app.innerHTML=`
  <a class="skiplink" href="#menu" data-a="tomenu">${t('ctaMenu')}</a>
  ${!open&&!tbl?`<div class="closedbar">${t('preorder')} · ${t('opensAt')} ${esc(st.open)}</div>`:''}
  <header class="hdr"><div class="wrap">
    <a class="brand" href="#" data-a="home" aria-label="AMORA — café · bar · lounge"><img src="assets/brand/wordmark.webp" alt="AMORA café · bar · lounge" width="677" height="189"></a>
    ${tbl?'':`<nav class="gnav" aria-label="${t('navOpen')}">${navItems().map(([v,l])=>`<button data-a="goto" data-v="${v}">${l}</button>`).join('')}</nav>`}
    <div class="sp"></div>
    ${active.length?`<button class="trackpill" data-a="track" data-id="${active[0].id}"><i class="dot"></i>№${active[0].n}<span class="hide-m"> · ${stLabel(active[0])}</span></button>`:''}
    <div class="langs" role="group" aria-label="Language">${['hy','ru','en'].map(l=>`<button class="${L.lang===l?'on':''}" data-a="lang" data-l="${l}" lang="${l}" aria-pressed="${L.lang===l}">${l.toUpperCase()}</button>`).join('')}</div>
    <button class="iconbtn" data-a="cart" aria-label="${t('cart')}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><span class="hide-m">${t('cart')}</span><span class="cnt" id="cartCnt">${cartCount()}</span></button>
    ${tbl?'':`<button class="iconbtn burger" data-a="mp" aria-label="${t('navOpen')}" aria-expanded="false"><i></i><i></i></button>`}
  </div></header>
  ${tbl?'':`<div class="mpanel" id="mpanel"><nav>${navItems().map(([v,l],i)=>`<button data-a="goto" data-v="${v}" style="--d:${i*50}ms"><small>0${i+1}</small>${l}</button>`).join('')}</nav>
    <div class="mpc"><a href="${TEL}">${IC.phone}${esc(CONTACT.phone)}</a><a href="${IGURL}" target="_blank" rel="noopener">${IC.ig}@${esc(CONTACT.instagram)}</a><a href="${MAPURL}" target="_blank" rel="noopener">${IC.pin}${t('addr')}</a></div></div>`}
  ${tbl?tableHero(myCalls):hero(open)}
  <div class="menublock"><nav class="mnav" id="mnav"><div class="wrap">
    <div class="depsw" role="tablist" aria-label="${t('menu')}">${['kitchen','bar'].map(k=>`<button role="tab" aria-selected="${(view.dep||'kitchen')===k}" class="${(view.dep||'kitchen')===k?'on':''}" data-a="dep" data-v="${k}">${k==='kitchen'?'🍽':'🍸'} ${nm(DEPS[k])}</button>`).join('')}</div>
    <div class="cats" id="cats" ${pubCats().length?'':'hidden'}><button class="${!view.cat?'on':''}" data-a="cat" data-c="">${t('all')}</button>${pubCats().map(c=>`<button data-a="cat" data-c="${c.id}" class="${view.cat===c.id?'on':''}">${nm(c)}</button>`).join('')}</div>
    <label class="srch"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="${t('search')}" aria-label="${t('search')}" value="${esc(view.q)}"></label>
  </div></nav>
  <main class="wrap" id="menu">
    ${st.promo&&st.promo.on&&nm(st.promo)?`<div class="promo"><span class="k">${t('promoL')}</span><b>${esc(nm(st.promo))}</b></div>`:''}
    <div class="filters">${['hit','new','veg','spicy'].filter(f=>DISHES.some(d=>!d.hidden&&(d.tags||[]).includes(f))).map(f=>`<button data-a="filt" data-f="${f}" class="${view.filters.has(f)?'on':''}">${t(f)}</button>`).join('')}</div>
    <div id="dishes">${dishesHTML()}</div>
  </main></div>
  ${tbl?'':featHTML()}
  <footer class="ftr"><div class="wrap">
    <div class="fbrand"><img src="assets/brand/logo.webp" alt="AMORA café · bar · lounge" width="685" height="493" loading="lazy"><p class="fseo">${t('seoText')}</p></div>
    <div class="fcols">
      ${tbl?'':`<div><h5>${t('navOpen')}</h5>${navItems().map(([v,l])=>`<button class="flink" data-a="goto" data-v="${v}">${l}</button>`).join('')}</div>`}
      <div><h5>${t('contacts')}</h5><a class="flink" href="${MAPURL}" target="_blank" rel="noopener">${t('addr')}</a><a class="flink" href="${TEL}">${esc(CONTACT.phone)}</a><a class="flink" href="${IGURL}" target="_blank" rel="noopener">@${esc(CONTACT.instagram)}</a></div>
      <div><h5>${t('hours')}</h5><p>${t('daily')}</p><p>${esc(st.open)} — ${esc(st.close)}</p>${L.my.length?`<button class="flink" data-a="mine" style="margin-top:12px;color:var(--gold2)">${t('myOrders')} (${L.my.length}) →</button>`:''}</div>
    </div>
    <div class="fbot"><span>© ${new Date().getFullYear()} AMORA · ${t('tag')}</span><span>${t('rights')} · <a href="privacy.html" data-a="privacy" style="color:inherit;text-decoration:underline">${t('privacy')}</a></span><span class="fcred">${t('madeBy')} <a href="https://company.teduza.com/${L.lang==='en'?'':L.lang+'/'}" target="_blank" rel="noopener">M.A.R.S. COMPANION LLC</a></span></div>
  </div></footer>
  <div class="fbar ${cartCount()?'':'hidden'} ${ENTRY==='demo'?'raise':''}" id="fbar"><button data-a="cart"><span>${t('cart')} · ${cartCount()}</span><span>${fmt(cartSub())}</span></button></div>`;
  const q=$('#q');if(q)q.oninput=e=>{view.q=e.target.value;$('#dishes').innerHTML=dishesHTML()};
  document.body.classList.remove('mp-on');
  spy();heroBind();revealBind();
}
function preboxHTML(){const n=cartCount();if(view.mode==='table')return '';return n?`<label class="prebox"><input type="checkbox" name="pre" checked><span><b>${t('preT')}</b><small>${t('items')}: ${n} · ${fmt(cartSub())} — ${t('preS')}</small></span><button type="button" class="linkbtn" data-a="cart">${t('preEdit')}</button></label>`:`<div class="prebox"><span><b>${t('preT')}</b><small>${t('preEmpty')}</small></span><button type="button" class="linkbtn" data-a="preMenu">${t('preBtn')} →</button></div>`}
function heroSlides(){return HERO_SLIDES.map(id=>DMAP[id]).filter(d=>d&&d.photo&&!d.hidden&&d.avail)}
const pad2=n=>String(n).padStart(2,'0');
function heroCap(d,i,n){const c=CATS.find(c=>c.id===d.c);return `<div class="hct"><small>${pad2(i+1)} / ${pad2(n)} · ${esc(nm(c))}</small><b>${esc(nm(d.n))}</b></div>
  <div class="hcr"><span class="hpr">${priceLabel(d)}</span>${avail(d.id)?`<button class="hadd" data-a="open" data-id="${d.id}">${t('orderNow')}<span aria-hidden="true">+</span></button>`:`<span class="hso">${t('soldOut')}</span>`}</div>`}
function hero(open){const st=S.settings;const sl=heroSlides();if(heroI>=sl.length)heroI=0;
  return `<section class="hero" id="top">
  <div class="hbg" aria-hidden="true">${sl.map((d,i)=>`<i class="${i===heroI?'on':''}" style="background-image:url('${d.photo}-sm.webp')"></i>`).join('')}</div>
  <div class="wrap">
  <div class="htxt">
    <div class="eyebrow"><img class="emb" src="assets/brand/emblem.webp" alt="" width="163" height="273">${t('tag')}</div>
    <h1>${t('h1')}</h1>
    <p class="lead">${t('lead')}</p>
    <div class="ctas"><a class="btn gold" href="#menu" data-a="tomenu">${t('ctaMenu')} <span>→</span></a><button class="btn line" data-a="tobook">${t('ctaBook')}</button></div>
    <div class="chips">
      ${open?`<span class="chip"><i class="dot"></i><b>${t('openUntil')} ${esc(st.close)}</b></span>`:`<span class="chip" style="color:var(--warn)"><b style="color:var(--warn)">${t('closedNow')}</b> · ${t('opensAt')} ${esc(st.open)}</span>`}
      <span class="chip">${t('delivery')} <b>${st.delivery?'~'+etaMin('delivery')+' '+t('min'):t('unavail')}</b></span>
      <span class="chip">${t('pickup')} <b>${st.pickup?'~'+etaMin('pickup')+' '+t('min'):t('unavail')}</b></span>
      ${st.extra>0?`<span class="chip" style="color:var(--warn)">${t('kitchenBusy')}</span>`:''}
    </div>
  </div>
  ${sl.length?`<div class="hshow ${heroUserPaused||RM.matches?'stopped':''}" id="hshow" role="region" aria-roledescription="carousel" aria-label="AMORA — ${t('menu')}" tabindex="-1">
    <div class="arch" id="arch">${sl.map((d,i)=>`<figure class="hs ${i===heroI?'on':''}" aria-hidden="${i!==heroI}"><img src="${d.photo}.webp" srcset="${d.photo}-sm.webp 480w, ${d.photo}.webp 1080w" sizes="(max-width:760px) 90vw, 470px" alt="${esc(nm(d.n))}" ${i===heroI?'fetchpriority="high"':'loading="lazy"'} decoding="async" width="1080" height="1080"></figure>`).join('')}</div>
    <div class="hcap" id="hcap" aria-live="polite">${heroCap(sl[heroI],heroI,sl.length)}</div>
    <div class="hctl">
      <button class="hbtn" data-a="hprev" aria-label="${t('prev')}">${IC.arrowL}</button>
      <div class="hdots">${sl.map((d,i)=>`<button class="${i===heroI?'on':''}" data-a="hgo" data-i="${i}" aria-label="${esc(nm(d.n))}" aria-current="${i===heroI}"><i></i></button>`).join('')}</div>
      <button class="hbtn" data-a="hnext" aria-label="${t('next')}">${IC.arrowR}</button>
      <button class="hbtn hpp" data-a="hpp" aria-label="${heroUserPaused?t('play'):t('pause')}">${heroUserPaused?IC.play:IC.pause}</button>
    </div>
  </div>`:''}
  </div></section>`}
function heroGo(i){const sl=heroSlides();const sh=$('#hshow');if(!sl.length||!sh)return;heroI=(i+sl.length)%sl.length;
  sh.querySelectorAll('.hs').forEach((f,k)=>{f.classList.toggle('on',k===heroI);f.setAttribute('aria-hidden',k!==heroI);if(k===heroI){const im=f.querySelector('img');if(im&&im.loading==='lazy')im.loading='eager'}});
  document.querySelectorAll('.hbg i').forEach((f,k)=>f.classList.toggle('on',k===heroI));
  sh.querySelectorAll('.hdots button').forEach((b,k)=>{b.classList.toggle('on',k===heroI);b.setAttribute('aria-current',k===heroI)});
  const c=$('#hcap');if(c){c.innerHTML=heroCap(sl[heroI],heroI,sl.length);c.classList.remove('swap');void c.offsetWidth;c.classList.add('swap')}
  // warm the next image
  const nx=sl[(heroI+1)%sl.length];if(nx){const im=new Image();im.src=nx.photo+(innerWidth<760?'-sm':'')+'.webp'}
  heroPlan(true)}
function heroPlan(force){if(heroTm&&!force)return;clearTimeout(heroTm);heroTm=null;if(heroUserPaused||RM.matches)return;
  heroTm=setTimeout(()=>{heroTm=null;if(document.hidden||heroHover||!$('#hshow'))return;heroGo(heroI+1)},HERO_MS)}
function heroRestart(){const sh=$('#hshow');if(!sh)return;const b=sh.querySelector('.hdots button.on');if(b){b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}heroPlan(true)}
function heroBind(){const sh=$('#hshow');if(!sh){clearTimeout(heroTm);heroTm=null;return}
  sh.onmouseenter=()=>{heroHover=true;sh.classList.add('paused')};
  sh.onmouseleave=()=>{heroHover=false;sh.classList.remove('paused');heroRestart()};
  sh.onkeydown=e=>{if(e.key==='ArrowLeft'){heroGo(heroI-1)}else if(e.key==='ArrowRight'){heroGo(heroI+1)}};
  const ar=$('#arch');let x0=null,y0=0;
  ar.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  ar.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2)heroGo(heroI+(dx<0?1:-1))},{passive:true});
  heroPlan()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)heroRestart()});
let rio=null;function revealBind(){if(rio)rio.disconnect();if(RM.matches||!('IntersectionObserver' in window)){document.querySelectorAll('.rvl').forEach(e=>e.classList.add('in'));return}
  rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rvl:not(.in)').forEach(e=>rio.observe(e))}
function tableHero(calls){const w=calls.find(c=>c.kind==='waiter'),b=calls.find(c=>c.kind==='bill');
  const mine=S.orders.filter(o=>o.type==='table'&&o.table===view.table&&L.my.includes(o.id)&&o.status!=='cancel'&&!o.closed);
  const sum=mine.reduce((s,o)=>s+o.total,0);
  return `<section class="thero"><div class="wrap">
  <div class="eyebrow">AMORA · ${t('dinein')}</div>
  <h2>${t('yourTable')} <span>№${view.table}</span></h2>${ENTRY==='demo'?`<button class="linkbtn" data-a="pickTable" style="margin:2px 0 8px">↺ Сесть за другой стол (демо)</button>`:''}
  <p style="color:var(--mute)">${S.settings.tables?t('tableNote'):t('dinein')+' — '+t('unavail')}</p>
  ${view.tkey&&S.tables&&S.tables[view.table]&&view.tkey!==S.tables[view.table]?`<div class="note warn" style="max-width:520px">${t('qrBad')}</div>`:''}
  <div class="tactions">
    <button class="tact ${w?'done':''}" data-a="call" data-k="waiter"><b>${w?'✓ '+t('called'):t('callWaiter')}</b><small>${t('callS')}</small></button>
    <button class="tact ${b?'done':''}" data-a="bill"><b>${b?'✓ '+t('billAsked'):t('askBill')}</b><small>${t('billS')}</small></button>
  </div>
  ${S.settings.loyalty&&S.settings.loyalty.on?`<p style="color:var(--gold2);font-size:12.5px;margin-top:14px">🏆 ${t('tblRt')}</p>`:''}
  ${mine.length?`<div class="note" style="max-width:520px;margin-top:14px">${t('tableBill')}: ${mine.map(o=>`<b style="color:var(--ink)">№${o.n}</b> — ${stLabel(o)}`).join(' · ')} · <b style="color:var(--gold2)">${fmt(sum)}</b></div>`:''}
  </div></section>`}
function featHTML(){const st=S.settings;const today=new Date();const iso=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  const ways=[['table',t('w1'),t('w1s'),'tobook',t('ctaBook'),st.tables],['bike',t('delivery'),t('w2s'),'tomenu',t('orderNow'),st.delivery],['bag',t('pickup'),t('w3s'),'tomenu',t('orderNow'),st.pickup]];
  const bd=view.bookDone;
  return `<section class="how" id="deliv"><div class="wrap">
    <div class="shead rvl"><div class="eyebrow">${t('howE')}</div><h2>${t('howT')}</h2></div>
    <div class="ways">${ways.map(([ic,h,p,a,b,on],i)=>`<div class="way rvl" style="--d:${i*90}ms"><div class="wi">${IC[ic]}</div><span class="wn">0${i+1}</span><b>${h}</b><p>${p}</p>${on?`<button class="linkbtn" data-a="${a}">${b} →</button>`:`<span class="off">${t('dzOff')}</span>`}</div>`).join('')}</div>
    <div class="terms rvl">
      <div class="tz"><h4>${t('dzT')}</h4>${st.delivery?`<table class="ztab"><thead><tr><th>${t('zone')}</th><th>${t('dzFee')}</th></tr></thead><tbody>${st.zones.map(z=>`<tr><td>${esc(nm(z))}</td><td>${fmt(z.fee)}</td></tr>`).join('')}</tbody></table>`:`<p class="off">${t('delivery')} — ${t('dzOff')}</p>`}</div>
      <dl class="tf">
        <div><dt>${t('dzFrom')}</dt><dd>${fmt(st.freeFrom)}</dd></div>
        <div><dt>${t('minOrder')}</dt><dd>${fmt(st.minOrder)}</dd></div>
        <div><dt>${t('dzTime')}</dt><dd>${t('delivery')} ~${etaMin('delivery')} ${t('min')} · ${t('pickup')} ~${etaMin('pickup')} ${t('min')}</dd></div>
        <div><dt>${t('payment')}</dt><dd>${t('cash')} · ${t('card')}</dd></div>
      </dl>
    </div></div></section>${ratingHTML()}
  <section class="wrap book" id="book"><div class="rvl"><div class="eyebrow">${t('ctaBook')}</div><h2>${t('bookT')}</h2><p class="bks">${t('bookS')}</p>
    <a class="bkcall" href="${TEL}">${IC.phone}<span>${esc(CONTACT.phone)}</span></a></div>
  ${bd?`<div class="form bkok rvl in" role="status"><div class="okic">✓</div><h3>${t('bkDone')}</h3><p><b>${esc(bd.name)}</b> · ${dayLabel(bd.date)}, ${esc(bd.time)} · ${bd.guests} ${t('guests').toLowerCase()}</p>${bd.orderN?`<p class="preok">🍽 ${t('preOk')} №${bd.orderN} · <b>${fmt(bd.preSum)}</b><br><small>${t('preOkS')}</small></p><button class="linkbtn" data-a="track" data-id="${bd.orderId}">${t('open')||'→'} →</button>`:''}<p class="mute">${t('bkDoneS')}</p><div class="ctas"><a class="btn line" href="${TEL}">${t('call')}</a><button class="btn ghost" data-a="bkagain">${t('bkAgain')}</button></div></div>`:
  `<form class="form rvl" id="bookf" novalidate><div class="row2"><div class="fld"><label for="bk-n">${t('name')}</label><input id="bk-n" name="name" autocomplete="name" required value="${esc(L.prof.name||'')}"></div><div class="fld"><label for="bk-p">${t('phone')}</label><input id="bk-p" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+374" required value="${esc(L.prof.phone||'')}"></div></div>
  <div class="row3"><div class="fld"><label for="bk-d">${t('date')}</label><input id="bk-d" name="date" type="date" min="${iso(today)}" value="${iso(today)}"></div><div class="fld"><label for="bk-t">${t('time')}</label><input id="bk-t" name="time" type="time" step="900" value="19:00"></div><div class="fld"><label for="bk-g">${t('guests')}</label><select id="bk-g" name="guests">${[1,2,3,4,5,6,7,8,10,12,15,20].map(n=>`<option ${n===2?'selected':''}>${n}</option>`).join('')}</select></div></div>
  <div class="fld"><label for="bk-c">${t('bkNote')}</label><input id="bk-c" name="note" maxlength="200" placeholder="${t('bkNoteP')}"></div>
  <div id="prebox">${preboxHTML()}</div>
  <button class="btn gold" type="submit">${t('send')}</button><p class="fine">${t('noLogin').split('.')[0]}.</p></form>`}</section>
  <section class="contacts" id="contacts"><div class="wrap cgrid">
    <div class="rvl"><div class="eyebrow">${t('ctE')}</div><h2>${t('ctT')}</h2>
      <ul class="clist">
        <li>${IC.pin}<div><small>${t('adrL')}</small><a href="${MAPURL}" target="_blank" rel="noopener">${t('addr')}</a></div></li>
        <li>${IC.phone}<div><small>${t('phone')}</small><a href="${TEL}">${esc(CONTACT.phone)}</a></div></li>
        <li>${IC.clock}<div><small>${t('hours')}</small><span>${t('daily')} · ${esc(st.open)} — ${esc(st.close)}</span></div></li>
        <li>${IC.ig}<div><small>${t('insta')}</small><a href="${IGURL}" target="_blank" rel="noopener">@${esc(CONTACT.instagram)}</a></div></li>
      </ul>
      <div class="ctas"><a class="btn gold" href="${TEL}">${t('call')}</a><a class="btn line" href="${MAPURL}" target="_blank" rel="noopener">${t('route')} ↗</a></div>
    </div>
    <div class="cmos rvl" aria-hidden="true">${['cheese-platter','khachapuri-with-basturma','pesto'].filter(id=>DMAP[id]&&DMAP[id].photo).map((id,i)=>`<div class="cm c${i}"><img src="${DMAP[id].photo}-sm.webp" alt="" loading="lazy" decoding="async" width="480" height="480"></div>`).join('')}<img class="cemb" src="assets/brand/emblem.webp" alt="" width="163" height="273" loading="lazy"></div>
  </div></section>`}
const pubOk=d=>!d.hidden&&!d.deleted&&d.avail;
function pubCats(){const dp=view.dep||'kitchen';return CATS.filter(c=>c.dep===dp&&DISHES.some(d=>d.c===c.id&&pubOk(d)))}
function dishesHTML(){const q=view.q.trim().toLowerCase();let html='';const dp=view.dep||'kitchen';
  for(const c of CATS){if(c.dep!==dp)continue;if(view.cat&&view.cat!==c.id)continue;
    const list=DISHES.filter(d=>d.c===c.id&&pubOk(d)&&(!q||['ru','hy','en'].some(l=>(d.n[l]||'').toLowerCase().includes(q)||(d.d[l]||'').toLowerCase().includes(q)))&&[...view.filters].every(f=>(d.tags||[]).includes(f)));
    if(!list.length)continue;
    html+=`<section class="sec" id="c-${c.id}" data-cat="${c.id}"><h3>${nm(c)} <small>${list.length}</small></h3><div class="grid">${list.map(dishCard).join('')}</div></section>`}
  return html||`<div class="empty">${dp==='bar'&&!DISHES.some(d=>d.dep==='bar'&&pubOk(d))?t('barEmpty'):t('nothing')}</div>`}
function priceLabel(d){const g=d.opts&&d.opts.length===1?d.opts[0]:null;if(g&&g.ch.some(c=>c.p))return g.ch.map(c=>fmt(price(d.id)+(c.p||0)).replace(' ֏','')).join(' / ')+' ֏';return fmt(price(d.id))}
function dishCard(d){const ok=avail(d.id),q=qtyOf(d.id);
  let btn='';if(ok){if(d.opts)btn=`<button class="addb" data-a="open" data-id="${d.id}">+<span class="lt">&nbsp;${t('choose')}</span>${q?`<span class="qb">${q}</span>`:''}</button>`;
    else btn=q?`<span class="stepper" data-stop="1"><button data-a="dec" data-id="${d.id}">−</button><span>${q}</span><button data-a="inc" data-id="${d.id}">+</button></span>`:`<button class="addb" data-a="inc" data-id="${d.id}">+<span class="lt">&nbsp;${t('add')}</span></button>`}
  return `<article class="dish ${ok?'':'out'}" data-a="${ok?'open':''}" data-id="${d.id}">
   <div class="img"><div class="badges">${(d.tags||[]).map(x=>`<span class="bdg ${x}">${t(x)}</span>`).join('')}</div>${A(d.id)}${ok?'':`<div class="soldtag">${t('soldOut')}</div>`}</div>
   <div class="body"><h4>${esc(nm(d.n))}</h4><p>${esc(nm(d.d))}</p>
   <div class="foot"><span class="price">${priceLabel(d)}${d.w?`<small>${d.w} ${t(d.u)}</small>`:''}</span>${btn}</div></div></article>`}
function renderGuestBits(){const pb=$('#prebox');if(pb)pb.innerHTML=preboxHTML();const c=$('#cartCnt');if(c)c.textContent=cartCount();const fb=$('#fbar');if(fb){fb.classList.toggle('hidden',!cartCount());fb.innerHTML=`<button data-a="cart"><span>${t('cart')} · ${cartCount()}</span><span>${fmt(cartSub())}</span></button>`}
  const ds=$('#dishes');if(ds){const y=window.scrollY;ds.innerHTML=dishesHTML();window.scrollTo(0,y);spy()}if(view.drawer==='cart')renderDrawer();if(view.sheet)renderSheet()}
let io=null;function spy(){if(io)io.disconnect();if(view.cat)return;io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const id=e.target.dataset.cat;document.querySelectorAll('#cats button').forEach(b=>b.classList.toggle('on',b.dataset.c===id));const b=document.querySelector(`#cats button[data-c="${id}"]`);if(b&&b.parentElement)b.parentElement.scrollTo({left:b.offsetLeft-40,behavior:'smooth'})}})},{rootMargin:'-140px 0px -60% 0px'});document.querySelectorAll('.sec').forEach(s=>io.observe(s))}

/* ---- dish sheet ---- */
function openSheet(id){if(!avail(id))return;view.sheet=id;view.sheetQty=1;view.sheetOpts=defOpts(id);view.smodal=null;renderSheet();$('#sheet').classList.add('on');$('#ov').classList.add('on')}
function renderSheet(){const d=DMAP[view.sheet];if(!d)return;const el=$('#sheet');
  const unit=lineUnit({id:d.id,o:view.sheetOpts});
  el.innerHTML=`<div class="img"><button class="x" data-a="closeAll">✕</button>${A(d.id,true)}</div><div class="c">
  <div style="display:flex;gap:6px;margin-bottom:10px">${(d.tags||[]).map(x=>`<span class="bdg ${x}" style="position:static">${t(x)}</span>`).join('')}</div>
  <h3>${esc(nm(d.n))}</h3><div class="meta">${d.w?d.w+' '+t(d.u)+' · ':''}${nm(CATS.find(c=>c.id===d.c))}</div><p>${esc(nm(d.d))}</p>
  ${(d.opts||[]).map(g=>`<div class="ogrp"><h5>${nm(g)}</h5><div class="ochips">${g.ch.map((c,i)=>`<button class="${view.sheetOpts[g.id]===i?'on':''}" data-a="sopt" data-g="${g.id}" data-i="${i}">${nm(c)}${c.p?`<small>+${fmt(c.p)}</small>`:''}</button>`).join('')}</div></div>`).join('')}
  ${d.alg&&d.alg.length?`<div class="alg"><em>${t('allergens')}</em>${d.alg.map(a=>`<span>${nm(ALGN[a])}</span>`).join('')}</div>`:''}
  <div class="act"><span class="stepper sm" style="height:52px"><button data-a="sq" data-v="-1" style="height:52px">−</button><span>${view.sheetQty}</span><button data-a="sq" data-v="1" style="height:52px">+</button></span>
  <button class="btn gold" data-a="sheetAdd">${t('add')} · ${fmt(unit*view.sheetQty)}</button></div></div>`}

/* ---- drawer ---- */
function renderDrawer(){const el=$('#drawer');const tbl=view.mode==='table';
  if(view.drawer==='track'){const o=S.orders.find(o=>o.id===view.trackId);if(!o){closeAll();return}
    el.innerHTML=`<div class="dh"><h3>${t('orderN')} №${o.n}</h3><button class="x" data-a="closeAll">✕</button></div><div class="db">${trackHTML(o)}</div>`;bindRate();return}
  if(view.drawer==='mine'){const list=L.my.map(id=>S.orders.find(o=>o.id===id)).filter(Boolean).sort((a,b)=>b.ts-a.ts);
    el.innerHTML=`<div class="dh"><h3>${t('myOrders')}</h3><button class="x" data-a="closeAll">✕</button></div><div class="db">${list.length?list.map(o=>`<div class="mo"><div class="r1"><b>№${o.n}</b><span class="stbadge ${o.status==='done'?'ok':o.status==='cancel'?'bad':''}">${stLabel(o)}</span></div><p>${new Date(o.ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}, ${hm(o.ts)} · ${o.items.map(i=>i.q+'× '+esc(itemName(i))).join(', ')} · <b style="color:var(--ink)">${fmt(o.total)}</b></p><div class="btns"><button data-a="track" data-id="${o.id}">${t('open')}</button>${o.type!=='table'?`<button data-a="again" data-id="${o.id}">↻ ${t('repeat')}</button>`:''}</div></div>`).join(''):`<div class="empty">${t('noOrders')}</div>`}</div>`;return}
  if(view.drawer==='bill'){const mine=S.orders.filter(o=>o.type==='table'&&o.table===view.table&&L.my.includes(o.id)&&o.status!=='cancel'&&!o.closed);const sum=mine.reduce((s,o)=>s+o.total,0);
    el.innerHTML=`<div class="dh"><h3>${t('askBill')}</h3><button class="x" data-a="closeAll">✕</button></div><div class="db">${mine.flatMap(o=>o.items).map(i=>`<div class="sumrow"><span>${i.q} × ${esc(itemName(i))}</span><span>${fmt(i.p*i.q)}</span></div>`).join('')||`<p style="color:var(--mute)">—</p>`}${(sv=>sv?`<div class="sumrow"><span>${t('svc')} ${svcPct()}%</span><span>${fmt(sv)}</span></div>`:'')(mine.reduce((s,o)=>s+((o.svc&&o.svc.amt)||0),0))}<div class="sumrow t"><span>${t('total')}</span><span>${fmt(sum)}</span></div>${S.settings.loyalty&&S.settings.loyalty.on?`<div class="lbl">${t('rtShort')}</div><div class="row2"><div class="fld"><label>${t('name')}</label><input id="bname" value="${esc(L.prof.name||'')}"></div><div class="fld"><label>${t('tPhone')}</label><input id="bphone" type="tel" value="${esc(L.prof.phone||'')}" placeholder="+374"></div></div>`:''}<div class="lbl">${t('payment')}</div><div class="opt" data-a="billpay" data-v="cash"><i></i><div><b>${t('cash')}</b></div></div><div class="opt" data-a="billpay" data-v="card"><i></i><div><b>${t('card')}</b></div></div></div>`;return}
  if(view.step==='cart'){const list=cartList();const sub=cartSub();
    const ups=DISHES.filter(d=>['starters','soups'].includes(d.c)&&d.photo&&avail(d.id)&&!qtyOf(d.id)).slice(0,6);
    el.innerHTML=`<div class="dh"><h3>${t('yourOrder')}</h3><button class="x" data-a="closeAll">✕</button></div>
    <div class="db">${L.my.length&&!tbl?`<button class="linkbtn" data-a="mine" style="margin-bottom:6px">${t('myOrders')} (${L.my.length}) →</button>`:''}
    ${list.length?list.map(([k,l])=>{const os=optSel(l);return `<div class="ci"><div class="th">${A(l.id)}</div><div><b>${esc(nm(DMAP[l.id].n))}</b>${os.length?`<span class="optl">${os.map(nm).join(', ')}</span>`:''}<small>${fmt(lineUnit(l))}</small></div><span class="stepper sm"><button data-a="decK" data-k="${esc(k)}">−</button><span>${l.q}</span><button data-a="incK" data-k="${esc(k)}">+</button></span></div>`}).join('')+
      (ups.length?`<div class="lbl">${t('goes')}</div><div class="ups">${ups.map(d=>`<button class="u" data-a="${d.opts?'open':'inc'}" data-id="${d.id}">${A(d.id)}<b>${esc(nm(d.n))}</b><span>+ ${fmt(price(d.id))}</span></button>`).join('')}</div>`:'')
      :`<div class="empty"><div class="serif" style="font-size:28px;color:var(--ink)">${t('emptyCart')}</div><p>${t('emptySub')}</p></div>`}</div>
    ${list.length?`<div class="df">${!tbl&&S.settings.delivery?freeBar(sub):''}<div class="sumrow t"><span>${t('items')}</span><span>${fmt(sub)}</span></div><button class="btn gold" style="width:100%;margin-top:12px" data-a="step" data-s="checkout">${tbl?t('sendKitchen'):t('checkout')} →</button>${tbl?'':`<button class="btn line" style="width:100%;margin-top:8px;height:46px" data-a="toBookPre">📅 ${t('preCart')}</button>`}</div>`:''}`;return}
  if(view.step==='checkout'){const f=view.form,st=S.settings;const sub=cartSub();const open=isOpen();
    if(!tbl&&view.ctype==='delivery'&&!st.delivery)view.ctype='pickup';
    if(tbl){if(f.tphone==null)f.tphone=L.prof.phone||'';if(f.tname==null)f.tname=L.prof.name||''}
    if(!tbl&&!open){f.when='later';if(!f.time)f.time=S.settings.open}
    const types=tbl?[]:[['delivery',st.delivery],['pickup',st.pickup]];
    const closedCh=tbl?!st.tables:(!st.delivery&&!st.pickup);
    const belowMin=closedCh||(view.ctype==='delivery'&&sub<st.minOrder);
    el.innerHTML=`<div class="dh"><button class="x" data-a="step" data-s="cart">←</button><h3>${tbl?t('table')+' №'+view.table:t('checkout')}</h3><button class="x" data-a="closeAll">✕</button></div>
    <form class="db" id="cof" autocomplete="on">
    ${types.length?`<div class="seg">${types.map(([k,on])=>`<button type="button" data-a="ctype" data-v="${k}" class="${view.ctype===k?'on':''}" ${on?'':'disabled'}>${t(k)}</button>`).join('')}</div>`:''}
    ${!tbl&&!open?`<div class="note warn">${t('preorder')}</div>`:''}
    ${tbl?`<div class="note">${t('tableNote')} · ~${etaMin('table')} ${t('min')}</div>${st.loyalty&&st.loyalty.on?`<div class="row2"><div class="fld"><label>${t('tName')}</label><input name="tname" value="${esc(f.tname)}"></div><div class="fld"><label>${t('tPhone')} · ${t('optional')}</label><input name="tphone" type="tel" value="${esc(f.tphone)}" placeholder="+374"></div></div>`:''}`:`
      <div class="row2"><div class="fld"><label>${t('name')}</label><input name="name" value="${esc(f.name)}" autocomplete="given-name"></div><div class="fld"><label>${t('phone')}</label><input name="phone" type="tel" value="${esc(f.phone)}" placeholder="+374 __ __ __ __" autocomplete="tel"></div></div>
      ${L.prof.name?`<p style="font-size:11.5px;color:var(--dim);margin-top:6px">✓ ${t('saved')}</p>`:''}
      ${view.ctype==='delivery'?`<div class="lbl">${t('delivery')}</div><div class="fld"><label>${t('zone')}</label><select name="zone">${st.zones.map(z=>`<option value="${z.id}" ${f.zone===z.id?'selected':''}>${nm(z)} — ${sub>=st.freeFrom?t('free'):fmt(z.fee)}</option>`).join('')}</select></div>
      <div class="fld" style="margin-top:10px"><label>${t('street')}</label><input name="street" value="${esc(f.street)}" autocomplete="street-address"></div><div class="fld" style="margin-top:10px"><label>${t('apt')}</label><input name="apt" value="${esc(f.apt)}"></div>`:''}
      <div class="lbl">${t('when')}</div>
      <div class="seg"><button type="button" data-a="when" data-v="asap" class="${f.when==='asap'?'on':''}" ${open?'':'disabled'}>${t('asap')} · ~${etaMin(view.ctype)} ${t('min')}</button><button type="button" data-a="when" data-v="later" class="${f.when==='later'?'on':''}">${t('later')}</button></div>
      ${f.when==='later'?`<div class="fld"><input name="time" type="time" value="${esc(f.time||'')}"></div>`:''}
      <div class="lbl">${t('payment')}</div>
      <div class="opt ${f.pay==='cash'?'on':''}" data-a="pay" data-v="cash"><i></i><div><b>${t('cash')}</b><small>${t('cashS')}</small></div></div>
      ${f.pay==='cash'?`<div class="fld" style="margin:0 0 10px"><input name="change" inputmode="numeric" value="${esc(f.change)}" placeholder="${t('change')} … ֏"></div>`:''}
      <div class="opt ${f.pay==='card'?'on':''}" data-a="pay" data-v="card"><i></i><div><b>${t('card')}</b><small>${view.ctype==='delivery'?t('cardS'):t('cashS')}</small></div></div>`}
    <div class="lbl">${t('comment')}</div><div class="fld"><textarea name="note" placeholder="${t('commentPh')}">${esc(f.note)}</textarea></div>
    </form>
    <div class="df"><div id="sumbox">${sumHTML()}</div>
      ${closedCh?`<div class="note warn">${t('unavail')}</div>`:belowMin?`<div class="note warn">${t('minOrder')}: ${fmt(st.minOrder)}</div>`:''}
      <button class="btn gold" style="width:100%;margin-top:12px" data-a="place" ${belowMin?'disabled':''}>${tbl?t('sendKitchen'):t('place')}</button>
      ${tbl?'':`<p style="text-align:center;color:var(--dim);font-size:12px;margin-top:10px">${t('noLogin')}</p>`}
    </div>`;
    const form=$('#cof');form.oninput=e=>{if(e.target.name){view.form[e.target.name]=e.target.value;if(e.target.name==='zone')renderDrawer();if(['phone','tphone'].includes(e.target.name))phoneChanged()}};return}
  if(view.step==='done'){const o=S.orders.find(o=>o.id===view.trackId);if(!o)return;
    el.innerHTML=`<div class="dh"><h3>${t('orderN')} №${o.n}</h3><button class="x" data-a="closeAll">✕</button></div><div class="db"><div class="done-hero"><div class="ok">✓</div><h4>${t('thanks')}</h4><div class="num">${o.when==='later'&&o.time?t('later')+': '+esc(o.time):t('eta')+' ~'+etaMin(o.type)+' '+t('min')}</div></div>${trackHTML(o)}</div>`;bindRate()}
}
function bindRate(){const ta=$('#rtxt');if(ta)ta.oninput=e=>view.rateTxt[ta.dataset.id]=e.target.value}
function freeBar(sub){const f=S.settings.freeFrom;if(sub>=f)return `<div class="sumrow" style="color:var(--ok)"><span>✓ ${t('delivery')} — ${t('free')}</span></div>`;return `<div class="sumrow"><span>${t('toFree')}</span><span>${fmt(f-sub)}</span></div><div class="prog"><i style="width:${Math.min(100,sub/f*100)}%"></i></div>`}
function flow(o){return o.type==='delivery'?['new','accepted','cooking','ready','onway','done']:['new','accepted','cooking','ready','done']}
function stLabel(o,s=effS(o)){if(s==='cancel')return t('st_cancel');if(s==='ready'&&o.type==='pickup')return t('st_readyP');if(s==='done')return t(o.type==='delivery'?'st_done':o.type==='pickup'?'st_doneP':'st_doneT');return t('st_'+s)}
function trackHTML(o){if(effS(o)!==o.status)o={...o,status:effS(o),hist:{...o.hist,cooking:autoAt(o)}};const fl=flow(o),i=fl.indexOf(o.status);const mine=L.my.includes(o.id);
  let rate='';if(o.status==='done'&&mine){if(o.rating)rate=`<div class="rate"><h5>${t('rateThanks')}</h5><div class="stars">${[1,2,3,4,5].map(n=>`<button class="${n<=o.rating?'on':''}" tabindex="-1">★</button>`).join('')}</div></div>`;
    else{const r=view.rate[o.id]||0;rate=`<div class="rate"><h5>${t('rate')}</h5><div class="stars">${[1,2,3,4,5].map(n=>`<button class="${n<=r?'on':''}" data-a="star" data-id="${o.id}" data-v="${n}">★</button>`).join('')}</div>${r?`<div class="fld"><textarea id="rtxt" data-id="${o.id}" placeholder="${t('reviewPh')}">${esc(view.rateTxt[o.id]||'')}</textarea></div><button class="btn gold" style="width:100%;margin-top:10px;height:46px" data-a="sendRate" data-id="${o.id}">${t('sendR')}</button>`:''}</div>`}}
  const reason=o.reasonK?REASONS.find(r=>r.k===o.reasonK):null;
  const steps=o.status==='cancel'?`<div class="note warn">${t('st_cancel')}${reason?' — '+nm(reason):''}</div>`:`<div class="steps">${fl.map((s,k)=>`<div class="st ${k<i||o.status==='done'?'dn':k===i?'cur':''}"><i>${k<i||o.status==='done'?'✓':''}</i><div><b>${stLabel(o,s)}</b><small>${o.hist&&o.hist[s]?hm(o.hist[s]):''}${s==='onway'&&o.courier&&k<=i?' · '+t('courier')+': '+esc(o.courier):''}${k===i&&o.status!=='done'&&T.ru['stS_'+s]?' · '+t('stS_'+s):''}</small></div></div>`).join('')}</div>`;
  return `${rate}${steps}${o.status!=='done'&&o.status!=='cancel'?`<p style="font-size:12px;color:var(--dim);display:flex;gap:8px;align-items:center"><i class="dot"></i>${t('live')}</p>`:''}
  ${mine&&!['done','cancel'].includes(o.status)?`<button class="btn line" style="width:100%;height:46px;margin:4px 0 6px" data-a="tgFollow" data-id="${o.id}">${o.tgGuest?'✓ '+t('tgOn'):'✈ '+t('tgFollow')}</button>`:''}
  ${mine&&o.awarded?`<div class="note" style="color:var(--gold2);border-color:rgba(200,164,107,.35)">🏆 +${o.awarded} ${t('pts')} — ${t('rtShort')}</div>`:''}
  <div class="lbl">${t('yourOrder')}</div>${o.items.map(it=>`<div class="sumrow"><span>${it.q} × ${esc(itemName(it))}</span><span>${fmt(it.p*it.q)}</span></div>`).join('')}
  ${o.disc?`<div class="sumrow dsc"><span>${t('discL')} −${o.disc.pct}%</span><span>−${fmt(o.disc.amt)}</span></div>`:''}${o.fee?`<div class="sumrow"><span>${t('delivery')}</span><span>${fmt(o.fee)}</span></div>`:''}${o.svc&&o.svc.amt?`<div class="sumrow"><span>${t('svc')} ${o.svc.pct}%</span><span>${fmt(o.svc.amt)}</span></div>`:''}<div class="sumrow t"><span>${t('total')}</span><span>${fmt(o.total)}</span></div>
  <div class="note">${o.type==='table'?t('table')+' №'+o.table:t(o.type)}${o.type==='book'?' · '+dayLabel(o.date)+', '+esc(o.time)+' · '+t('onsite'):''}${o.pay&&!['table','book'].includes(o.type)?' · '+t(o.pay):''}${o.street?' · '+esc(o.street):''}</div>`}

/* ================= RENDER: STAFF ================= */
const typeLabel=o=>o.type==='table'?'Стол '+o.table:o.type==='delivery'?'Доставка':o.type==='book'?'Бронь · '+(o.date?o.date.slice(8,10)+'.'+o.date.slice(5,7)+' ':'')+(o.time||''):'Самовывоз';
const ago=ts=>{const m=Math.round((now()-ts)/60000);return m<1?'только что':m<60?m+' мин назад':Math.floor(m/60)+' ч '+(m%60)+' мин'};
function nextOf(o){const fl=flow(o),i=fl.indexOf(o.status);return fl[i+1]}
/* ================= STAFF v5: statuses, permissions, alerts ================= */
const AUTO_COOK_MS=5*60000;
const autoAt=o=>o.type==='book'&&o.at?o.at-30*60000:((o.hist||{}).accepted||o.ts)+AUTO_COOK_MS;
const effS=o=>o.status==='accepted'&&now()>=autoAt(o)?'cooking':o.status;
const STL={ready_kitchen:'Кухня: готово',ready_bar:'Бар: готово',new:'Новый',accepted:'Принят',cooking:'Готовится',ready:'Готов',onway:'В пути',done:'Завершён',cancel:'Отменён'};
function stRu(o,s=o.status){if(s==='ready')return o.type==='pickup'?'Готов к выдаче':o.type==='table'?'Готов к подаче':'Ждёт курьера';if(s==='done')return o.type==='delivery'?'Доставлен':o.type==='pickup'?'Выдан':'Подан';return STL[s]||s}
const badge=(o,s=o.status)=>`<span class="stb s-${s}">${stRu(o,s)}</span>`;
const nextLabel={accepted:'Принять',cooking:'Начать готовить',ready:'Готово',onway:'Передать курьеру',done:'Завершить'};
function advLabel(o,nx){if(nx==='cooking'&&o.status==='accepted'){const ms=autoAt(o)-now();if(o.type==='book')return 'Готовить сейчас · авто в '+hm(autoAt(o))+(isToday(autoAt(o))?'':' '+dd(autoAt(o)));const m=Math.max(1,Math.ceil(ms/60000));return 'Готовить сейчас · авто через '+m+' мин'}if(nx==='done')return o.type==='table'?'Подано':o.type==='pickup'?'Выдан':'Доставлен';return nextLabel[nx]}
const PERM={admin:['*'],manager:['order','cancel','pay','unpaid','avail','stats','history','export','ops'],waiter:['order','cancel','pay','history'],kitchen:['avail'],bar:['avail'],courier:['pay']};
const canAvail=d=>!!staffUser&&(isAdmin()||staffUser.role==='manager'||(['kitchen','bar'].includes(staffUser.role)&&d.dep===staffUser.role));
const can=p=>!!staffUser&&((PERM[staffUser.role]||[]).includes('*')||(PERM[staffUser.role]||[]).includes(p));
function canAdv(o,nx){if(!staffUser||!nx)return false;const r=staffUser.role;
  if(r==='kitchen'||r==='bar')return false;
  if(r==='courier')return o.type==='delivery'&&['onway','done'].includes(nx)&&['ready','onway'].includes(o.status);
  return can('order')}
const dayStart=(d=new Date())=>{const x=new Date(d);x.setHours(0,0,0,0);return x.getTime()};
const isToday=ts=>ts>=dayStart();
const dt=ts=>new Date(ts).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const dd=ts=>new Date(ts).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'});
const payRu=o=>o.type==='table'&&!o.paid?'При закрытии стола':o.type==='book'&&!o.paid?'При посещении (бронь)':((o.payM||o.pay)==='card'?'Карта (терминал)':'Наличные');
const paidBadge=o=>o.status==='cancel'?'<span class="pb na">—</span>':o.paid?`<span class="pb ok">Оплачен${o.payM?' · '+(o.payM==='card'?'карта':'нал.'):''}</span>`:'<span class="pb no">Не оплачен</span>';
function staffName(){return staffUser?staffUser.name:'—'}
function logA(a,d){S.audit=S.audit||[];S.audit.push({id:'a'+now().toString(36)+Math.random().toString(36).slice(2,6),ts:now(),by:staffUser?staffUser.id:'',name:staffName(),role:staffUser?staffUser.role:'',a,d:String(d||'').slice(0,300)});if(S.audit.length>500)S.audit=S.audit.slice(-500)}
function setStatus(o,s,extra,by,at){if(s==='ready'){o.dept=o.dept||{};depsOf(o).forEach(d=>{if(!o.dept[d])o.dept[d]=at||now()})}o.status=s;o.hist=o.hist||{};o.hist[s]=at||now();o.trail=o.trail||[];o.trail.push({s,ts:at||now(),by:by||staffName()});if(extra)Object.assign(o,extra);
  if(s==='done')award(o);notify('status',o.id);}
function findOrder(id){return S.orders.find(o=>o.id===id)||(view.hcache&&view.hcache.list.find(o=>o.id===id))}
/* --- alerts: new orders & calls, без дублей --- */
const alerted=new Set();let alertInit=false;
function staffAlerts(){if(view.mode!=='staff'||!staffAuthed||!staffUser)return;
  const fresh=S.orders.filter(o=>o.status==='new'&&visO(o)&&!alerted.has(o.id));const calls=S.calls.filter(c=>!c.done&&!alerted.has(c.id));
  if(!alertInit){alertInit=true;fresh.forEach(o=>alerted.add(o.id));calls.forEach(c=>alerted.add(c.id));['kitchen','bar'].forEach(d=>S.orders.filter(o=>prepVisible(o,d)).forEach(o=>alerted.add(o.id+':'+d)));if(fresh.length&&!['kitchen','bar'].includes(staffUser.role))toast('Ждут принятия: '+fresh.length+' заказ(а)','gold');return}
  if(['kitchen','bar'].includes(staffUser.role)){const d=staffUser.role;fresh.forEach(o=>alerted.add(o.id));calls.forEach(c=>alerted.add(c.id));
    const work=S.orders.filter(o=>prepVisible(o,d)&&!(o.dept&&o.dept[d])&&!alerted.has(o.id+':'+d));if(!work.length)return;
    work.forEach(o=>{alerted.add(o.id+':'+d);view.flash.add(o.id);toast(DEPI[d]+' В работу: №'+o.n+' · '+o.items.filter(i=>itemDep(i)===d).reduce((s,i)=>s+i.q,0)+' поз.','gold');sysNote('№'+o.n+' в работу',DEPS[d].ru)});if(L.sound!==false)ding();return}
  if(!fresh.length&&!calls.length)return;
  fresh.forEach(o=>{alerted.add(o.id);view.flash.add(o.id);toast('🔔 Новый заказ №'+o.n+' · '+typeLabel(o)+' · '+fmt(o.total),'gold');sysNote('Новый заказ №'+o.n,typeLabel(o)+' · '+fmt(o.total))});
  calls.forEach(c=>{alerted.add(c.id);toast(c.kind==='bill'?'🧾 Стол '+c.table+' просит счёт':'🔔 Стол '+c.table+' зовёт официанта','gold');sysNote('Стол '+c.table,c.kind==='bill'?'Просит счёт':'Зовёт официанта')});
  if(L.sound!==false)ding()}
function sysNote(title,body){try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification('AMORA · '+title,{body,icon:'assets/brand/apple-touch-icon.png',tag:title})}catch(e){}}
/* --- idle session lock (12 h) --- */
let lastAct=now();['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{lastAct=now()},{passive:true}));
setInterval(()=>{if(view.mode==='staff'&&staffAuthed&&now()-lastAct>12*3600e3){staffAuthed=false;staffUser=null;alertInit=false;alerted.clear();if(LIVE&&BK)BK.logout();renderAll();toast('Сессия завершена после 12 ч бездействия')}},60000);

const SIC={menuK:'<path d="M6 13a6 6 0 1 1 12 0v6H6z"/><path d="M4 19h16"/>',menuB:'<path d="M6 4h12l-6 8z"/><path d="M12 12v8M8 20h8"/>',dash:'<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z"/>',orders:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',kitchen:'<path d="M6 13a6 6 0 1 1 12 0v6H6z"/><path d="M4 19h16"/>',calls:'<path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16z"/><path d="M10 21h4"/>',history:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',stop:'<path d="M4 6h16M4 12h16M4 18h10"/>',bookings:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',guests:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 11a3 3 0 1 0 0-6M21 20c0-2-1.5-4-4-4.6"/>',tables:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h6v6h-6z"/>',reviews:'<path d="m12 4 2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 19.2 8 13.7 4 9.8l5.5-.8z"/>',stats:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',tg:'<path d="m3 11 18-7-3 16-6-5-3 4v-6l9-7"/>',team:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',audit:'<path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h2"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'};
const sico=k=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SIC[k]||''}</svg>`;

function renderStaff(){const app=$('#app');
  if(!staffAuthed){
    const head=`<div class="lbrand"><img src="assets/brand/emblem.webp" alt="" width="40"><div><b>AMORA</b><small>Панель ресторана</small></div></div>`;
    if(LIVE){app.innerHTML=`<div class="staff login"><div class="lbox">${head}<form id="loginf" class="form" style="margin-top:26px;text-align:left"><div class="fld"><label for="lg-e">Логин</label><input id="lg-e" name="email" type="text" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="username" required></div><div class="fld"><label for="lg-p">Пароль</label><input id="lg-p" name="pw" type="password" autocomplete="current-password" required></div><button class="btn gold" type="submit">Войти</button></form><p class="lnote">Доступ только для сотрудников AMORA. Аккаунт выдаёт администратор.</p></div></div>`;return}
    if(ENTRY!=='demo'){app.innerHTML=`<div class="staff login"><div class="lbox">${head}<div class="lwarn">Сервер не подключён. Вход в панель станет доступен после подключения сервера (assets/config.js).</div></div></div>`;return}
    app.innerHTML=`<div class="staff login"><div class="lbox">${head}
    ${ENTRY==='demo'?'':`<div class="lwarn">Локальный режим: сервер не подключён — данные хранятся только в этом браузере. Для работы ресторана подключите Firebase (README).</div>`}
    <p style="color:var(--mute);margin-top:18px;font-size:13.5px">Вход по PIN-коду</p>
    <div class="pin">${[0,1,2,3].map(i=>`<i class="${i<pin.length?'f':''}"></i>`).join('')}</div>
    <div class="pad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>k===''?'<span></span>':`<button data-a="pin" data-k="${k}">${k}</button>`).join('')}</div>
    ${ENTRY==='demo'?`<div class="pinhint">${S.staff.map(x=>`<span><b>${esc(x.pin)}</b> ${(ROLES[x.role]||{}).n||x.role}</span>`).join('')}</div>`:''}</div></div>`;return}
  if(!canTab(view.staffTab))view.staffTab=(ROLE_TABS[staffUser.role]||['orders'])[0];
  const act=S.orders.filter(o=>visO(o));
  const cnt={orders:act.filter(o=>o.status==='new').length,kitchen:S.orders.filter(o=>['accepted','cooking'].includes(o.status)).length,calls:S.calls.filter(c=>!c.done).length,menuK:DISHES.filter(d=>d.dep==='kitchen'&&!d.avail&&!d.deleted).length,menuB:DISHES.filter(d=>d.dep==='bar'&&!d.avail&&!d.deleted).length,bookings:S.bookings.filter(b=>b.status==='new').length,reviews:S.orders.filter(o=>o.rating&&!o.rSeen).length};
  const tabs=(ROLE_TABS[staffUser.role]||[]).map(k=>[k,TABS[k],cnt[k]||0]);
  const st=S.settings;const accepting=st.delivery||st.pickup||st.tables;
  const body=({dash:sDash,orders:sOrders,kitchen:sKitchen,calls:sCalls,history:sHistory,menuK:()=>sStop('kitchen'),menuB:()=>sStop('bar'),guests:sGuests,tables:sTables,bookings:sBook,reviews:sReviews,tg:sTg,team:sTeam,settings:sSet,stats:sStats,audit:sAudit})[view.staffTab]();
  app.innerHTML=`<div class="staff sx ${view.side?'side-on':''}">
  <aside class="sside" aria-label="Разделы панели">
    <div class="sbrand"><img src="assets/brand/emblem.webp" alt="" width="26"><div><b>AMORA</b><small>Панель ресторана</small></div></div>
    <nav>${tabs.map(([k,l,n])=>`${k===(tabs.find(x=>x[0].startsWith('menu'))||[])[0]?'<div class="sgrp">Управление меню</div>':''}<button class="${k.startsWith('menu')?'sub ':''}${view.staffTab===k?'on':''}" data-a="stab" data-t="${k}">${sico(k)}<span>${l}</span>${n?`<em class="${k==='orders'||k==='calls'?'hot':''}">${n}</em>`:''}</button>`).join('')}</nav>
    <div class="sfoot">
      <div class="me"><b>${esc(staffUser.name)}</b><small>${(ROLES[staffUser.role]||{}).n||staffUser.role}${staffUser.email?' · '+esc(staffUser.email):''}</small></div>
      <div class="sfb"><button class="sbtn ghost" data-a="sound" title="Звук уведомлений">${L.sound===false?'🔇 Звук выкл.':'🔊 Звук вкл.'}</button>${'Notification' in window&&Notification.permission==='default'?'<button class="sbtn ghost" data-a="notifPerm">🔔 Push в браузере</button>':''}</div>
      <div class="sfb">${ENTRY!=='demo'?'<a class="sbtn ghost" href="index.html" target="_blank" rel="noopener">Сайт ↗</a>':''}<button class="sbtn ghost" data-a="logout">Выйти</button></div>
    </div>
  </aside>
  <div class="sbody">
    <header class="shead2"><button class="sbtn ghost sburg" data-a="side" aria-label="Меню разделов">☰</button><h1>${TABS[view.staffTab]}</h1>
      <span class="live ${LIVE?'':'loc'}"><i class="dot"></i>${LIVE?'Онлайн':'Локально'}</span>
      <span class="acc ${accepting?'':'off'}">${accepting?'Приём заказов включён':'Приём заказов выключен'}</span><div class="sp"></div>
      ${ENTRY==='demo'&&isAdmin()?'<button class="sbtn gold" data-a="fake">+ Тестовый заказ</button>':''}
      <span class="clock" id="sclock">${hm(now())}</span></header>
    ${!LIVE&&ENTRY==='admin'?'<div class="lwarn top">Локальный режим без сервера: заказы гостей сюда не приходят. Подключите Firebase в assets/config.js.</div>':''}
    <main class="smain">${body}</main>
  </div><div class="sside-ov" data-a="side"></div></div>`;
  if(view.staffTab==='tables')drawQRs();
  const keepInput=(sel,key)=>{const q=$(sel);if(q){q.oninput=e=>{view[key]=e.target.value;const p=q.selectionStart;renderStaff();const n=$(sel);if(n){n.focus();try{n.setSelectionRange(p,p)}catch(_){}}}}};
  keepInput('#stopq','stopq');keepInput('#gq','gq');keepInput('#hq','hq');keepInput('#aq','aq');
  document.querySelectorAll('.msgs').forEach(m=>m.scrollTop=m.scrollHeight);
}
setInterval(()=>{const c=$('#sclock');if(c)c.textContent=hm(now())},15000);
// Через 5 минут после «Принят» заказ автоматически переходит в «Готовится» (делает любая открытая панель с правами)
function autoCook(){if(view.mode!=='staff'||!staffAuthed||!staffUser||!['admin','manager','waiter','kitchen'].includes(staffUser.role))return;
  const due=S.orders.filter(o=>o.status==='accepted'&&now()>=autoAt(o));if(!due.length)return;
  due.forEach(o=>setStatus(o,'cooking',null,o.type==='book'?'Авто · за 30 мин до брони':'Авто · 5 мин',Math.min(now(),autoAt(o))));commit(true);if(!typing())renderAll()}
setInterval(autoCook,15000);

function orderCard(o){const nx=nextOf(o);const z=S.settings.zones.find(z=>z.id===o.zone);const late=o.status==='new'&&now()-o.ts>5*60000;
  let act='';
  if(o.type==='delivery'&&o.status==='ready'&&canAdv(o,'onway'))act=`<div class="rsn">${(S.settings.couriers&&S.settings.couriers.length?S.settings.couriers:['Курьер']).map(c=>`<button data-a="courier" data-id="${o.id}" data-c="${esc(c)}">→ ${esc(c)}</button>`).join('')}</div>`;
  else if(canAdv(o,nx))act=`<button class="sbtn ${o.status==='new'?'gold':'pri'} wide" data-a="adv" data-id="${o.id}">${advLabel(o,nx)}</button>`;
  return `<article class="oc s-${o.status} ${view.flash.has(o.id)?'flash':''} ${late?'late':''}" data-a="od" data-id="${o.id}" tabindex="0">
  <div class="h"><b>№${o.n}</b><span class="tp ${o.type}">${typeLabel(o)}</span><small title="${dt(o.ts)}">${hm(o.ts)} · ${ago(o.ts)}</small></div>
  ${o.type!=='table'?`<div class="who"><b>${esc(o.name)}</b> · ${esc(o.phone)}${o.type==='delivery'?`<br>${esc(o.street)}${o.apt?', '+esc(o.apt):''}${z?' · '+z.ru:''}`:''}${o.type==='book'?`<br>📅 Бронь: <b>${o.date?o.date.slice(8,10)+'.'+o.date.slice(5,7):''} ${esc(o.time||'')}</b> · ${o.guests||'?'} гост.`:o.when==='later'?`<br>⏰ Ко времени: <b>${esc(o.time)}</b>`:''}${o.courier?`<br>🛵 ${esc(o.courier)}`:''}</div>`:''}
  <ul>${itemsGrouped(o,null,i=>`<li><span><b>${i.q}×</b> ${esc(itemName(i,'ru'))}</span></li>`)}</ul>
  ${o.note?`<div class="nt">💬 ${esc(o.note)}</div>`:''}
  <div class="ft"><span class="tot">${fmt(o.total)}</span>${paidBadge(o)}</div>
  <div data-stop="1">${act}</div></article>`}
const DEPI={kitchen:'🍽',bar:'🍸'};
function itemsGrouped(o,only,li){const ds=depsOf(o).filter(d=>!only||d===only);const both=depsOf(o).length>1;
  return ds.map(d=>`${both||only?`<li class="dh d-${d}">${DEPI[d]} ${DEPS[d].ru.toUpperCase()}${o.dept&&o.dept[d]?' · ✓ готово':''}</li>`:''}${o.items.filter(i=>itemDep(i)===d).map(li).join('')}`).join('')}
const prepVisible=(o,dep)=>['accepted','cooking','ready'].includes(o.status)&&depsOf(o).includes(dep)&&!(o.type==='book'&&o.at&&o.at-now()>90*60000);
function depCard(o,dep){const done=o.dept&&o.dept[dep];const from=(o.hist&&(o.hist.cooking||o.hist.accepted))||o.ts;const m=Math.floor((now()-from)/60000);const other=depsOf(o).filter(d=>d!==dep);
  return `<article class="kt ${done?'g':m<15?'g':m<25?'a':'r'} ${done?'kdone':''}"><div class="hd"><b>№${o.n}</b><span class="tp ${o.type}">${typeLabel(o)}</span><span class="tm">${done?'✓':m+'′'}</span></div>
  <ul>${o.items.filter(i=>itemDep(i)===dep).map(i=>`<li><b>${i.q}</b>${esc(i.n.ru)}${i.o&&i.o.length?`<small>${i.o.map(x=>esc(x.ru)).join(', ')}</small>`:''}</li>`).join('')}</ul>
  ${o.note?`<div class="nt">💬 ${esc(o.note)}</div>`:''}${o.type==='book'?`<div class="nt">📅 К брони ${esc(o.time||'')}</div>`:o.when==='later'?`<div class="nt">⏰ К ${esc(o.time)}</div>`:''}
  ${other.length?`<div class="koth">+ в заказе есть ${other.map(d=>DEPS[d].ru.toLowerCase()+(o.dept&&o.dept[d]?' ✓':'')).join(', ')}</div>`:''}
  ${done?`<div class="kok">Готово в ${hm(done)}</div>`:`<button class="sbtn ok wide" data-a="depReady" data-id="${o.id}" data-d="${dep}">✓ ${DEPS[dep].ru}: готово</button>`}</article>`}
function prepBoard(dep){const all=S.orders.filter(o=>visO(o)&&prepVisible(o,dep));const todo=all.filter(o=>!(o.dept&&o.dept[dep])).sort((a,b)=>a.ts-b.ts);const done=all.filter(o=>o.dept&&o.dept[dep]).sort((a,b)=>b.dept[dep]-a.dept[dep]).slice(0,12);
  const waitN=S.orders.filter(o=>o.status==='new'&&depsOf(o).includes(dep)).length;const later=S.orders.filter(o=>o.type==='book'&&['accepted','cooking'].includes(o.status)&&depsOf(o).includes(dep)&&o.at-now()>90*60000).length;
  const agg={};todo.forEach(o=>o.items.filter(i=>itemDep(i)===dep).forEach(i=>{const k=itemName(i,'ru');agg[k]=(agg[k]||0)+i.q}));
  return `<div class="ksum">${Object.entries(agg).map(([k,q])=>`<span><b>${q}×</b> ${esc(k)}</span>`).join('')||`<span class="muted">${dep==='bar'?'Напитков в работе нет':'Блюд в работе нет'}</span>`}${waitN?`<span style="color:var(--warn)">Ждут принятия официантом: ${waitN}</span>`:''}${later?`<span class="muted">Предзаказы к броням позже: ${later}</span>`:''}</div>
  <div class="klbl">${dep==='bar'?'🍸 Готовить в баре':'🍽 Готовить на кухне'} · ${todo.length}</div><div class="kds">${todo.map(o=>depCard(o,dep)).join('')||'<p class="empty2">Очередь пуста</p>'}</div>
  <div class="klbl">Готово, ждёт выдачи · ${done.length}</div><div class="kds">${done.map(o=>depCard(o,dep)).join('')||'<p class="empty2">—</p>'}</div>`}
const OFILT=[['all','Все'],['delivery','Доставка'],['pickup','Самовывоз'],['table','Зал'],['book','Брони']];
function sOrders(){const cols=[['new','Новые',['new']],['accepted','Приняты',['accepted']],['cooking','Готовятся',['cooking']],['ready','Готовы / в пути',['ready','onway']]];
  const f=view.ofilt||'all';const ok=o=>visO(o)&&(f==='all'||o.type===f);
  const doneT=S.orders.filter(o=>ok(o)&&isToday(o.ts)&&['done','cancel'].includes(o.status)).sort((a,b)=>b.ts-a.ts);
  const r=staffUser.role;const odep=['kitchen','bar'].includes(r)?r:(view.odep||'all');
  const dsw=['kitchen','bar'].includes(r)?'':`<div class="seg dseg">${[['all','Все заказы'],['kitchen','🍽 Кухня'],['bar','🍸 Бар']].map(([k,l])=>`<button class="${odep===k?'on':''}" data-a="odep" data-v="${k}">${l}${k!=='all'?` <em>${S.orders.filter(o=>visO(o)&&prepVisible(o,k)&&!(o.dept&&o.dept[k])).length}</em>`:''}</button>`).join('')}</div>`;
  if(odep!=='all')return `<div class="tbar">${dsw}<div class="sp"></div><span class="muted">${odep==='bar'?'Только напитки из заказов':'Только блюда кухни из заказов'}</span></div>${prepBoard(odep)}`;
  return `<div class="tbar">${dsw}<div class="seg">${OFILT.map(([k,l])=>`<button class="${f===k?'on':''}" data-a="ofilt" data-v="${k}">${l}</button>`).join('')}</div><div class="sp"></div><span class="muted">Нажмите на карточку — полная информация и действия</span></div>
  <div class="kan k4">${cols.map(([s,l,ss])=>{const list=S.orders.filter(o=>ss.includes(o.status)&&ok(o)).sort((a,b)=>a.ts-b.ts);return `<section class="col c-${s}"><h4>${l}<em>${list.length}</em></h4>${list.map(orderCard).join('')||'<p class="empty2">Пусто</p>'}</section>`}).join('')}</div>
  ${can('history')?`<div class="panel" style="margin-top:16px"><h4>Завершённые и отменённые сегодня — ${doneT.length}</h4>${histTable(doneT.slice(0,30))}${doneT.length>30?'<button class="sbtn ghost" data-a="stab" data-t="history">Вся история →</button>':''}</div>`:''}`}
function sKitchen(){const q=S.orders.filter(o=>o.status==='accepted').sort((a,b)=>a.ts-b.ts);const list=S.orders.filter(o=>o.status==='cooking').sort((a,b)=>(a.hist.cooking||a.ts)-(b.hist.cooking||b.ts));
  const agg={};[...q,...list].forEach(o=>o.items.forEach(i=>{const k=itemName(i,'ru');agg[k]=(agg[k]||0)+i.q}));
  const waiting=S.orders.filter(o=>o.status==='new').length;
  const tk=(o,cook)=>{const m=Math.floor((now()-(cook?(o.hist.cooking||o.ts):(o.hist.accepted||o.ts)))/60000);const c=!cook?'q':m<15?'g':m<25?'a':'r';return `<div class="kt ${c}"><div class="hd"><b>№${o.n}</b><span class="tp ${o.type}">${typeLabel(o)}</span><span class="tm">${m}′</span></div><ul>${o.items.map(i=>`<li><b>${i.q}</b>${esc(i.n.ru)}${i.o&&i.o.length?`<small>${i.o.map(x=>esc(x.ru)).join(', ')}</small>`:''}</li>`).join('')}</ul>${o.note?`<div class="nt">💬 ${esc(o.note)}</div>`:''}${o.when==='later'?`<div class="nt">⏰ К ${esc(o.time)}</div>`:''}<button class="sbtn ${cook?'ok':'pri'} wide" data-a="adv" data-id="${o.id}">${cook?'✓ Готово':'▶ Начать готовить'}</button></div>`};
  return `<div class="ksum">${Object.entries(agg).map(([k,q])=>`<span><b>${q}×</b> ${esc(k)}</span>`).join('')||'<span class="muted">Сейчас ничего не готовится</span>'}${waiting?`<span style="color:var(--warn)">Ждут принятия официантом: ${waiting}</span>`:''}</div>
  <div class="klbl">Очередь — приняты, ещё не начаты · ${q.length}</div><div class="kds">${q.map(o=>tk(o,false)).join('')||'<p class="empty2">Очередь пуста</p>'}</div>
  <div class="klbl">Готовятся · ${list.length}</div><div class="kds">${list.map(o=>tk(o,true)).join('')||'<p class="empty2">—</p>'}</div>
  <p class="muted" style="margin-top:16px">Таймер: зелёный до 15 мин, жёлтый до 25, дальше красный.</p>`}

/* --- dashboard --- */
function sDash(){const today=S.orders.filter(o=>isToday(o.ts)&&visO(o));const by=s=>today.filter(o=>s.includes(o.status));
  const paid=today.filter(o=>o.paid&&o.status!=='cancel');const rev=paid.reduce((s,o)=>s+o.total,0);
  const unpaid=S.orders.filter(o=>o.status==='done'&&!o.paid&&o.type!=='table');
  const k=(l,n,cls,t,sub)=>`<button class="kc ${cls}" data-a="stab" data-t="${t}"><small>${l}</small><b>${n}</b>${sub?`<span>${sub}</span>`:''}</button>`;
  const newO=S.orders.filter(o=>o.status==='new'&&visO(o)).sort((a,b)=>a.ts-b.ts);const calls=S.calls.filter(c=>!c.done);
  const longCook=S.orders.filter(o=>o.status==='cooking'&&now()-(o.hist.cooking||o.ts)>25*60000);
  const waitCour=S.orders.filter(o=>o.type==='delivery'&&o.status==='ready');
  const tb=S.bookings.filter(b=>b.status!=='no'&&b.date===new Date(now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10));
  const feed=today.flatMap(o=>(o.trail&&o.trail.length?o.trail:Object.entries(o.hist||{}).map(([s,ts])=>({s,ts}))).map(e=>({...e,o}))).sort((a,b)=>b.ts-a.ts).slice(0,14);
  const att=[...newO.map(o=>`<div class="arow" data-a="od" data-id="${o.id}"><span class="stb s-new">Новый</span><b>№${o.n}</b><span>${typeLabel(o)} · ${fmt(o.total)}</span><small>${ago(o.ts)}</small>${canAdv(o,'accepted')?`<button class="sbtn gold" data-a="adv" data-id="${o.id}" data-stop="1">Принять</button>`:''}</div>`),
    ...calls.map(c=>`<div class="arow"><span class="stb s-cancel">${c.kind==='bill'?'Счёт':'Вызов'}</span><b>Стол ${c.table}</b><span>${c.kind==='bill'?'просит счёт':'зовёт официанта'}</span><small>${ago(c.ts)}</small>${canTab('calls')?'<button class="sbtn" data-a="stab" data-t="calls">Открыть</button>':''}</div>`),
    ...waitCour.map(o=>`<div class="arow" data-a="od" data-id="${o.id}"><span class="stb s-ready">Курьер</span><b>№${o.n}</b><span>готов, ждёт курьера</span><small>${ago(o.hist.ready||o.ts)}</small></div>`),
    ...longCook.map(o=>`<div class="arow" data-a="od" data-id="${o.id}"><span class="stb s-cooking">Долго</span><b>№${o.n}</b><span>готовится дольше 25 мин</span><small>${Math.floor((now()-(o.hist.cooking||o.ts))/60000)} мин</small></div>`),
    ...(can('pay')?unpaid.slice(0,5).map(o=>`<div class="arow" data-a="od" data-id="${o.id}"><span class="stb s-cancel">Оплата</span><b>№${o.n}</b><span>завершён без оплаты · ${fmt(o.total)}</span><small>${dd(o.ts)}</small></div>`):[])];
  const st=S.settings;
  return `<div class="kgrid">
    ${k('Новые',by(['new']).length,'c-new','orders')}${k('Приняты',by(['accepted']).length,'c-accepted','orders')}${k('Готовятся',by(['cooking']).length,'c-cooking',canTab('kitchen')?'kitchen':'orders')}${k('Готовы / в пути',by(['ready','onway']).length,'c-ready','orders')}${k('Завершены',by(['done']).length,'c-done',canTab('history')?'history':'orders')}${k('Отменены',by(['cancel']).length,'c-cancel',canTab('history')?'history':'orders')}${k('Всего сегодня',today.length,'c-all',canTab('history')?'history':'orders')}
  </div>
  ${can('stats')?`<div class="kgrid k2"><div class="kc static"><small>Выручка сегодня · оплачено</small><b>${fmt(rev)}</b><span>${paid.length} оплаченных</span></div><div class="kc static"><small>Средний чек · оплаченные</small><b>${fmt(paid.length?rev/paid.length:0)}</b></div><div class="kc static ${unpaid.length?'warn':''}"><small>Завершены без оплаты</small><b>${unpaid.length}</b><span>${fmt(unpaid.reduce((s,o)=>s+o.total,0))}</span></div><div class="kc static"><small>Брони на сегодня</small><b>${tb.length}</b><span>${tb.reduce((s,b)=>s+(+b.guests||0),0)} гостей</span></div></div>`:''}
  <div class="dgrid">
    <section class="panel"><h4>Требует внимания <em class="cnt">${att.length}</em></h4>${att.join('')||'<p class="empty2">Всё под контролем — новых заказов и вызовов нет.</p>'}</section>
    <section class="panel"><h4>Активность сегодня</h4>${feed.map(e=>`<div class="frow" data-a="od" data-id="${e.o.id}"><small>${hm(e.ts)}</small><b>№${e.o.n}</b>${badge(e.o,e.s)}<span class="muted">${e.by?esc(e.by):''}</span></div>`).join('')||'<p class="empty2">Сегодня заказов ещё не было.</p>'}</section>
    ${can('ops')?`<section class="panel"><h4>Приём заказов</h4>${[['delivery','Доставка'],['pickup','Самовывоз'],['tables','Заказ со столов (QR)']].map(([k,l])=>`<div class="setrow"><b>${l}</b><button class="sw ${st[k]?'on':''}" data-a="setb" data-k="${k}" aria-label="${l}"></button></div>`).join('')}
      <div class="setrow"><div><b>Загрузка кухни</b><small>+ минут к ожиданию для гостей</small></div><div style="display:flex;gap:4px">${[0,15,30,45].map(m=>`<button class="sbtn ${+st.extra===m?'pri':''}" data-a="extra" data-v="${m}" style="height:34px;padding:0 10px">${m?'+'+m:'0'}</button>`).join('')}</div></div></section>`:''}
  </div>`}

/* --- order detail / cancel / pay modals --- */
function orderModal(o){const nx=nextOf(o);const z=S.settings.zones.find(z=>z.id===o.zone);
  const tl=(o.trail&&o.trail.length?o.trail:Object.entries(o.hist||{}).map(([s,ts])=>({s,ts}))).slice().sort((a,b)=>a.ts-b.ts);
  const acts=[];
  if(o.type==='delivery'&&o.status==='ready'&&canAdv(o,'onway'))acts.push(`<div class="rsn">${(S.settings.couriers&&S.settings.couriers.length?S.settings.couriers:['Курьер']).map(c=>`<button data-a="courier" data-id="${o.id}" data-c="${esc(c)}">Передать: ${esc(c)}</button>`).join('')}</div>`);
  else if(canAdv(o,nx))acts.push(`<button class="sbtn ${o.status==='new'?'gold':'pri'}" data-a="adv" data-id="${o.id}">${advLabel(o,nx)}</button>`);
  if(['accepted','cooking'].includes(o.status))depsOf(o).forEach(d=>{if(!(o.dept&&o.dept[d])&&staffUser&&(['admin','manager','waiter'].includes(staffUser.role)||staffUser.role===d))acts.push(`<button class="sbtn ok" data-a="depReady" data-id="${o.id}" data-d="${d}">${DEPI[d]} ${DEPS[d].ru}: готово</button>`)});
  if(!o.paid&&o.status!=='cancel'&&o.type!=='table'&&can('pay'))acts.push(`<button class="sbtn ok" data-a="payask" data-id="${o.id}">Отметить оплату</button>`);
  if(!['done','cancel'].includes(o.status)&&can('cancel'))acts.push(`<button class="sbtn ghost danger" data-a="cancelask" data-id="${o.id}">Отменить заказ</button>`);
  return `<div class="c od"><div class="mh"><div><h3>Заказ №${o.n}</h3><div class="mrow">${badge(o)}<span class="tp ${o.type}">${typeLabel(o)}</span>${paidBadge(o)}</div></div><button class="x" data-a="closeAll" aria-label="Закрыть">✕</button></div>
  <div class="odg">
    <div class="odb"><h5>Гость</h5>${o.name?`<p><b>${esc(o.name)}</b></p>`:''}${o.phone?`<p><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></p>`:'<p class="muted">Телефон не указан</p>'}${o.type==='table'?`<p>Стол <b>${o.table}</b></p>`:''}</div>
    <div class="odb"><h5>${o.type==='delivery'?'Доставка':o.type==='pickup'?'Самовывоз':o.type==='book'?'Предзаказ к брони':'Зал'}</h5>${o.type==='book'?`<p>📅 <b>${o.date?o.date.split('-').reverse().join('.'):''}, ${esc(o.time||'')}</b></p><p>Гостей: ${o.guests||'—'}</p><p class="muted">Автостарт кухни: ${hm(autoAt(o))}</p>`:''}${o.type==='delivery'?`<p>${esc(o.street||'')}${o.apt?', '+esc(o.apt):''}</p><p class="muted">Зона: ${z?z.ru:'—'}</p>`:''}${o.type==='book'?'':`<p>${o.when==='later'?'⏰ Ко времени: <b>'+esc(o.time)+'</b>':'Как можно скорее'}</p>`}${o.courier?`<p>🛵 Курьер: <b>${esc(o.courier)}</b></p>`:''}</div>
    <div class="odb"><h5>Создан</h5><p>${dt(o.ts)}</p><h5 style="margin-top:10px">Оплата</h5><p>${payRu(o)}${o.change&&!o.paid?' · сдача с '+fmt(+o.change):''}</p>${o.paid?`<p class="muted">Отмечено: ${o.paidBy?esc(o.paidBy)+', ':''}${o.paidAt?dt(o.paidAt):''}</p>`:''}</div>
  </div>
  <table class="oit"><thead><tr><th>Блюдо</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${(()=>{const only=['kitchen','bar'].includes(staffUser&&staffUser.role)?staffUser.role:null;const both=depsOf(o).length>1;return depsOf(o).filter(d=>!only||d===only).map(d=>`${both||only?`<tr class="dh"><td colspan="4">${DEPI[d]} ${DEPS[d].ru.toUpperCase()} ${o.dept&&o.dept[d]?'<span class="pb ok">✓ готово '+hm(o.dept[d])+'</span>':['accepted','cooking'].includes(o.status)?'<span class="pb no">готовится</span>':''}</td></tr>`:''}${o.items.filter(i=>itemDep(i)===d).map(i=>`<tr><td>${esc(i.n.ru)}${i.o&&i.o.length?`<small>${i.o.map(x=>esc(x.ru)).join(', ')}</small>`:''}</td><td>${i.q}</td><td>${fmt(i.p)}</td><td>${fmt(i.p*i.q)}</td></tr>`).join('')}`).join('')})()}</tbody>
  <tfoot><tr><td colspan="3">Подытог</td><td>${fmt(o.sub??o.items.reduce((s,i)=>s+i.p*i.q,0))}</td></tr>${o.disc?`<tr><td colspan="3">Скидка рейтинга −${o.disc.pct}%</td><td>−${fmt(o.disc.amt)}</td></tr>`:''}${o.fee?`<tr><td colspan="3">Доставка</td><td>${fmt(o.fee)}</td></tr>`:''}${o.svc&&o.svc.amt?`<tr><td colspan="3">Обслуживание ${o.svc.pct}%</td><td>${fmt(o.svc.amt)}</td></tr>`:''}<tr class="tt"><td colspan="3">Итого</td><td>${fmt(o.total)}</td></tr></tfoot></table>
  ${o.note?`<div class="nt">💬 ${esc(o.note)}</div>`:''}
  ${o.status==='cancel'?`<div class="nt bad">Причина отмены: ${esc(o.reasonTxt||(REASONS.find(r=>r.k===o.reasonK)||{}).ru||'—')}</div>`:''}
  <h5 class="tlh">История статусов</h5><ol class="tl">${tl.map(e=>`<li>${badge(o,e.s)}<span>${dt(e.ts)}</span>${e.by?`<small>${esc(e.by)}</small>`:''}</li>`).join('')}</ol>
  <div class="mact">${acts.join('')}<div class="sp"></div><button class="sbtn ghost" data-a="rcpt" data-id="${o.id}">Чек / печать</button></div></div>`}
function cancelModal(o){const r=view.cancelK;return `<div class="c"><div class="mh"><h3>Отменить заказ №${o.n}?</h3><button class="x" data-a="closeAll">✕</button></div>
  <p class="muted" style="margin:6px 0 14px">Гость увидит статус «Отменён» и причину. Действие записывается в журнал.</p>
  <div class="rsn col">${REASONS.map(x=>`<button class="${r===x.k?'on':''}" data-a="cancelK" data-k="${x.k}">${x.ru}</button>`).join('')}</div>
  <div class="mact"><button class="sbtn ghost" data-a="od" data-id="${o.id}">Назад</button><div class="sp"></div><button class="sbtn danger" data-a="cancelGo" data-id="${o.id}" ${r?'':'disabled'}>Подтвердить отмену</button></div></div>`}
function payModal(o,finish){return `<div class="c"><div class="mh"><h3>${finish?'Завершить заказ':'Оплата заказа'} №${o.n}</h3><button class="x" data-a="closeAll">✕</button></div>
  <p style="margin:6px 0 4px">К оплате: <b style="font-size:22px">${fmt(o.total)}</b></p><p class="muted" style="margin-bottom:16px">Гость выбрал: ${(o.pay==='card')?'карта (терминал)':'наличные'+(o.change?', сдача с '+fmt(+o.change):'')}</p>
  <div class="paybtns"><button class="sbtn ok" data-a="payGo" data-id="${o.id}" data-m="cash" data-f="${finish?1:0}">💵 Получено наличными</button><button class="sbtn ok" data-a="payGo" data-id="${o.id}" data-m="card" data-f="${finish?1:0}">💳 Оплачено картой</button></div>
  ${finish&&can('unpaid')?`<button class="sbtn ghost" data-a="finUnpaid" data-id="${o.id}" style="margin-top:12px">Завершить без оплаты (долг)</button>`:''}</div>`}

/* --- history --- */
function histTable(list){if(!list.length)return '<p class="empty2">Ничего не найдено</p>';
  return `<div class="tblw"><table class="ht"><thead><tr><th>№</th><th>Дата</th><th>Тип</th><th>Гость</th><th class="hm2">Телефон</th><th>Сумма</th><th class="hm2">Оплата</th><th>Статус</th></tr></thead><tbody>${list.map(o=>`<tr data-a="od" data-id="${o.id}"><td><b>${o.n}</b></td><td>${dd(o.ts)} ${hm(o.ts)}</td><td><span class="tp ${o.type}">${o.type==='table'?'Стол '+o.table:o.type==='delivery'?'Доставка':'Самовывоз'}</span></td><td>${esc(o.name||'—')}</td><td class="hm2">${esc(o.phone||'')}</td><td>${fmt(o.total)}</td><td class="hm2">${paidBadge(o)}</td><td>${badge(o)}</td></tr>`).join('')}</tbody></table></div>`}
const isoD=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function histRange(){const f=view.hfrom||isoD(now()-6*864e5),t=view.hto||isoD(now());return [new Date(f+'T00:00').getTime(),new Date(t+'T00:00').getTime()+864e5]}
function ordersIn(from,to){const base=S.orders.filter(o=>o.ts>=from&&o.ts<to);if(!LIVE)return base;const c=view.hcache;if(c&&c.from<=from&&c.to>=to){const m=new Map(c.list.filter(o=>o.ts>=from&&o.ts<to).map(o=>[o.id,o]));base.forEach(o=>m.set(o.id,o));return [...m.values()]}return base}
async function loadRange(from,to){if(!LIVE||!BK||!BK.fetchOrders)return;const c=view.hcache;if(c&&c.from<=from&&c.to>=to)return;view.hloading=true;renderStaff();try{const list=await BK.fetchOrders(from,to);view.hcache={from,to,list}}catch(e){toast('Не удалось загрузить: '+(e.code||e.message))}view.hloading=false;renderStaff()}
function histFiltered(){const [from,to]=histRange();const q=(view.hq||'').trim().toLowerCase().replace(/^№/,'');const s=view.hst||'all',ty=view.hty||'all';
  return ordersIn(from,to).filter(o=>visO(o)&&(s==='all'||(s==='unpaid'?o.status==='done'&&!o.paid:s==='ready'?['ready','onway'].includes(o.status):o.status===s))&&(ty==='all'||o.type===ty)&&(!q||String(o.n)===q||String(o.n).startsWith(q)||(o.name||'').toLowerCase().includes(q)||(o.phone||'').replace(/\D/g,'').includes(q.replace(/\D/g,'')||'§'))).sort((a,b)=>b.ts-a.ts)}
function sHistory(){const [from,to]=histRange();if(LIVE)setTimeout(()=>loadRange(from,to),0);const list=histFiltered();const lim=view.hlim||100;
  const paidSum=list.filter(o=>o.paid&&o.status!=='cancel').reduce((s,o)=>s+o.total,0);
  return `<div class="filters2">
    <label class="fq"><input id="hq" type="search" placeholder="№ заказа, имя или телефон" value="${esc(view.hq||'')}"></label>
    <label>С <input type="date" data-a="hfrom" value="${view.hfrom||isoD(now()-6*864e5)}"></label><label>По <input type="date" data-a="hto" value="${view.hto||isoD(now())}"></label>
    <select data-a="hst"><option value="all">Все статусы</option>${['new','accepted','cooking','ready','done','cancel'].map(s=>`<option value="${s}" ${view.hst===s?'selected':''}>${STL[s]}${s==='ready'?' / в пути':''}</option>`).join('')}<option value="unpaid" ${view.hst==='unpaid'?'selected':''}>Завершён без оплаты</option></select>
    <select data-a="hty"><option value="all">Все типы</option>${OFILT.slice(1).map(([k,l])=>`<option value="${k}" ${view.hty===k?'selected':''}>${l}</option>`).join('')}</select>
    ${can('export')?'<button class="sbtn ghost" data-a="csv">⬇ CSV</button>':''}</div>
  <p class="muted" style="margin:10px 0">${view.hloading?'Загрузка…':`Найдено: <b>${list.length}</b> · оплачено на <b>${fmt(paidSum)}</b>`}</p>
  ${histTable(list.slice(0,lim))}${list.length>lim?`<button class="sbtn ghost" data-a="hmore" style="margin-top:12px">Показать ещё (${list.length-lim})</button>`:''}`}

/* --- reports --- */
const RANGES=[['today','Сегодня'],['7','7 дней'],['30','30 дней'],['month','Этот месяц'],['pmonth','Прошлый месяц']];
function statRange(){const r=view.srange||'7';const d0=dayStart();if(r==='today')return [d0,d0+864e5,r];if(r==='7')return [d0-6*864e5,d0+864e5,r];if(r==='30')return [d0-29*864e5,d0+864e5,r];
  const n=new Date();if(r==='month')return [new Date(n.getFullYear(),n.getMonth(),1).getTime(),d0+864e5,r];return [new Date(n.getFullYear(),n.getMonth()-1,1).getTime(),new Date(n.getFullYear(),n.getMonth(),1).getTime(),r]}
function barChart(rows,fmtV,color){const mx=Math.max(1,...rows.map(r=>r[1]));const w=Math.max(rows.length*28,300),h=170;const bw=Math.max(6,Math.min(26,(w-20)/rows.length-6));
  return `<div class="chart"><svg viewBox="0 0 ${w} ${h+26}" preserveAspectRatio="none" role="img">${[0.25,0.5,0.75,1].map(k=>`<line x1="0" x2="${w}" y1="${h-h*k}" y2="${h-h*k}" stroke="rgba(255,255,255,.06)"/>`).join('')}
  ${rows.map((r,i)=>{const x=10+i*((w-20)/rows.length)+((w-20)/rows.length-bw)/2;const bh=r[1]/mx*(h-14);return `<g><rect x="${x}" y="${h-bh}" width="${bw}" height="${Math.max(bh,r[1]?2:0)}" rx="3" fill="${color}"><title>${r[0]}: ${fmtV(r[1])}</title></rect>${rows.length<=16||i%Math.ceil(rows.length/12)===0?`<text x="${x+bw/2}" y="${h+16}" text-anchor="middle" font-size="10" fill="#8a8377">${r[0]}</text>`:''}</g>`}).join('')}</svg>
  <div class="cmax">макс. ${fmtV(mx)}</div></div>`}
function sStats(){const [from,to,r]=statRange();if(LIVE)setTimeout(()=>loadRange(from,to),0);
  const all=ordersIn(from,to);const valid=all.filter(o=>o.status!=='cancel');const paid=valid.filter(o=>o.paid);const rev=paid.reduce((s,o)=>s+o.total,0);
  const canc=all.filter(o=>o.status==='cancel');const unpaid=valid.filter(o=>o.status==='done'&&!o.paid);const open=valid.filter(o=>o.status!=='done');
  const buckets=[];if(r==='today'){for(let h=0;h<24;h++)buckets.push([String(h).padStart(2,'0'),from+h*3600e3,from+(h+1)*3600e3])}else{for(let t=from;t<to;t+=864e5)buckets.push([dd(t),t,t+864e5])}
  const cntRows=buckets.map(([l,a,b])=>[l,valid.filter(o=>o.ts>=a&&o.ts<b).length]);const revRows=buckets.map(([l,a,b])=>[l,paid.filter(o=>o.ts>=a&&o.ts<b).reduce((s,o)=>s+o.total,0)]);
  const cnt={};valid.forEach(o=>o.items.forEach(i=>cnt[i.n.ru]=(cnt[i.n.ru]||0)+i.q));const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,10);const mx=top[0]?top[0][1]:1;
  const sts=['new','accepted','cooking','ready','onway','done','cancel'].map(s=>[s,all.filter(o=>o.status===s).length]).filter(x=>x[1]);const smx=Math.max(1,...sts.map(x=>x[1]));
  const by={delivery:0,pickup:0,table:0,book:0};paid.forEach(o=>by[o.type]=(by[o.type]||0)+o.total);const pm={cash:0,card:0};paid.forEach(o=>pm[o.payM||o.pay||'cash']+=o.total);
  return `<div class="tbar"><div class="seg">${RANGES.map(([k,l])=>`<button class="${r===k?'on':''}" data-a="srange" data-v="${k}">${l}</button>`).join('')}</div><div class="sp"></div><span class="muted">${dd(from)} — ${dd(to-1)}${view.hloading?' · загрузка…':''}</span></div>
  <div class="kgrid k2"><div class="kc static"><small>Заказов (без отменённых)</small><b>${valid.length}</b><span>за период</span></div><div class="kc static"><small>Выручка · только оплаченные</small><b>${fmt(rev)}</b><span>${paid.length} оплачено</span></div><div class="kc static"><small>Средний чек</small><b>${fmt(paid.length?rev/paid.length:0)}</b><span>по оплаченным</span></div><div class="kc static ${canc.length?'warn':''}"><small>Отменено</small><b>${canc.length}</b><span>${all.length?Math.round(canc.length/all.length*100):0}% от всех</span></div></div>
  ${unpaid.length||open.length?`<p class="muted" style="margin:-4px 0 14px">Не входит в выручку: ${unpaid.length} завершённых без оплаты (${fmt(unpaid.reduce((s,o)=>s+o.total,0))}), ${open.length} ещё в работе.</p>`:''}
  <div class="sgrid">
    <section class="panel"><h4>Заказы по ${r==='today'?'часам':'дням'}</h4>${barChart(cntRows,v=>v+' шт.','#6FA8DC')}</section>
    <section class="panel"><h4>Выручка по ${r==='today'?'часам':'дням'} (оплачено)</h4>${barChart(revRows,v=>fmt(v),'#CBA662')}</section>
    <section class="panel"><h4>Топ блюд</h4><p class="s">Порций за период, без отменённых</p>${top.map(([n,q])=>`<div class="bar"><span>${esc(n)}</span><span class="t"><i style="width:${q/mx*100}%"></i></span><b>${q}</b></div>`).join('')||'<p class="empty2">Нет данных</p>'}</section>
    <section class="panel"><h4>Статусы заказов</h4>${sts.map(([s,n])=>`<div class="bar"><span>${STL[s]}</span><span class="t"><i class="s-${s}" style="width:${n/smx*100}%"></i></span><b>${n}</b></div>`).join('')||'<p class="empty2">Нет данных</p>'}</section>
    <section class="panel"><h4>Каналы · выручка</h4>${[['delivery','Доставка'],['pickup','Самовывоз'],['table','Зал (QR)'],['book','Предзаказ к брони']].map(([k,l])=>`<div class="bar"><span>${l}</span><span class="t"><i style="width:${rev?by[k]/rev*100:0}%"></i></span><b>${fmt(by[k])}</b></div>`).join('')}</section>
    <section class="panel"><h4>Кухня и бар · продажи</h4><p class="s">Сумма позиций в оплаченных заказах</p>${(()=>{const sm={kitchen:0,bar:0},qn={kitchen:0,bar:0};paid.forEach(o=>o.items.forEach(i=>{const d=itemDep(i);sm[d]+=i.p*i.q;qn[d]+=i.q}));const t2=sm.kitchen+sm.bar;return ['kitchen','bar'].map(d=>`<div class="bar"><span>${DEPI[d]} ${DEPS[d].ru} · ${qn[d]} поз.</span><span class="t"><i style="width:${t2?sm[d]/t2*100:0}%"></i></span><b>${fmt(sm[d])}</b></div>`).join('')})()}</section>
    <section class="panel"><h4>Способы оплаты</h4>${[['cash','Наличные'],['card','Карта']].map(([k,l])=>`<div class="bar"><span>${l}</span><span class="t"><i style="width:${rev?pm[k]/rev*100:0}%"></i></span><b>${fmt(pm[k])}</b></div>`).join('')}</section>
  </div>`}

/* --- audit log --- */
function sAudit(){const q=(view.aq||'').toLowerCase();const list=[...(S.audit||[])].sort((a,b)=>b.ts-a.ts).filter(x=>!q||(x.name+' '+x.a+' '+x.d).toLowerCase().includes(q)).slice(0,400);
  return `<div class="filters2"><label class="fq"><input id="aq" type="search" placeholder="Поиск: сотрудник, действие, № заказа" value="${esc(view.aq||'')}"></label></div>
  <p class="muted" style="margin:10px 0">Журнал важных действий: отмены, оплаты, цены и меню, настройки, сотрудники. Записи нельзя изменить или удалить.</p>
  ${list.length?`<div class="tblw"><table class="ht"><thead><tr><th>Время</th><th>Сотрудник</th><th>Действие</th><th>Подробности</th></tr></thead><tbody>${list.map(x=>`<tr><td>${dt(x.ts)}</td><td>${esc(x.name)}<small class="muted"> · ${(ROLES[x.role]||{}).n||x.role}</small></td><td><b>${esc(x.a)}</b></td><td>${esc(x.d)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty2">Записей пока нет</p>'}`}
function toCSV(list){const rows=[['№','Дата','Время','Тип','Стол','Гость','Телефон','Адрес','Блюда','Сумма','Оплата','Оплачен','Статус']].concat(list.map(o=>[o.n,new Date(o.ts).toLocaleDateString('ru-RU'),hm(o.ts),o.type,o.table||'',o.name||'',o.phone||'',[o.street,o.apt].filter(Boolean).join(', '),o.items.map(i=>'['+DEPS[itemDep(i)].ru+'] '+i.q+'× '+i.n.ru).join('; '),o.total,o.payM||o.pay||'',o.paid?'да':'нет',stRu(o)]));
  return '﻿'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n')}

function sCalls(){const open=S.calls.filter(c=>!c.done).sort((a,b)=>a.ts-b.ts);
  return `<div style="max-width:720px">${open.length?open.map(c=>{const own=c.kind==='bill'&&Array.isArray(c.orders)&&c.orders.length;const tot=S.orders.filter(o=>o.type==='table'&&o.table===c.table&&o.status!=='cancel'&&!o.closed&&(!own||c.orders.includes(o.id))).reduce((s,o)=>s+o.total,0);
   return `<div class="callc act"><div class="tn">${c.table}</div><div style="flex:1"><b>${c.kind==='bill'?(own?'Счёт гостя'+(c.name?' · '+esc(c.name):'')+' · заказы №'+S.orders.filter(o=>c.orders.includes(o.id)).map(o=>o.n).join(', №'):'Просит счёт'):'Зовёт официанта'}</b><small>${ago(c.ts)}${c.kind==='bill'?' · '+(c.pay==='card'?'картой (терминал)':'наличными')+' · к оплате '+fmt(tot):''}</small></div>
   ${c.kind==='bill'?`<button class="sbtn ok" data-a="closeTable" data-id="${c.id}">${own?'Оплачено, закрыть счёт':'Оплачено, закрыть стол'}</button>`:`<button class="sbtn ok" data-a="ack" data-id="${c.id}">Иду</button>`}</div>`}).join(''):`<div class="panel"><h4>Вызовов нет</h4><p class="s">Когда гость нажмёт «Позвать официанта» или «Попросить счёт», здесь появится карточка, прозвучит сигнал, а официанту придёт push-уведомление на телефон.</p></div>`}</div>`}
function sStop(dep){view.menuDep=dep;const q=(view.stopq||'').toLowerCase();const adm=canMenu(),av=staffUser&&canAvail({dep});const live=DISHES.filter(d=>!d.deleted&&d.dep===dep);const del=DISHES.filter(d=>d.deleted&&d.dep===dep);
  const offN=live.filter(d=>!d.avail).length;
  return `<div class="tbar"><input id="stopq" class="sinput" type="search" placeholder="Поиск блюда…" value="${esc(view.stopq||'')}"><div class="seg">${canTab('menuK')?`<button class="${dep==='kitchen'?'on':''}" data-a="stab" data-t="menuK">🍽 Кухня</button>`:''}${canTab('menuB')?`<button class="${dep==='bar'?'on':''}" data-a="stab" data-t="menuB">🍸 Бар</button>`:''}</div>${adm?`<button class="sbtn gold" data-a="newDish">+ ${dep==='bar'?'Новый напиток':'Новое блюдо'}</button>`:''}<div class="sp"></div><span class="muted">${live.length} позиций · в стоп-листе: <b style="color:var(--warn)">${offN}</b></span></div>
  <p class="muted" style="margin:0 0 14px">${adm?'Переключатель — наличие: выключенная позиция сразу исчезает с сайта и её нельзя заказать. Цена меняется прямо в поле. ✎ — название, описание, фото, категория, удаление.':av?'Вам доступно только наличие блюд: переключатель — «есть / нет». Цены и описания меняет администратор.':'Просмотр меню.'}</p>
  ${CATS.filter(c=>c.dep===dep).map(c=>{const list=live.filter(d=>d.c===c.id&&(!q||['ru','hy','en'].some(l=>(d.n[l]||'').toLowerCase().includes(q))));if(!list.length)return q?'':`<div class="lbl">${c.ru} <small>0</small></div><p class="empty2">Пока пусто${adm?' — нажмите «+ '+(dep==='bar'?'Новый напиток':'Новое блюдо')+'»':''}</p>`;return `<div class="lbl">${c.ru} <small>${list.length}</small></div><div class="stop">${list.map(d=>`<div class="si ${d.avail&&!d.hidden?'':'off'}"><div class="th">${A(d.id)}</div><div class="nm"><b>${esc(d.n.ru)}</b><small>${d.hidden?'Скрыто с сайта':d.avail?'В наличии':'Стоп-лист'}</small></div><label class="prw"><input class="pr" data-a="price" data-id="${d.id}" value="${d.p}" inputmode="numeric" aria-label="Цена" ${adm?'':'disabled'}><span>֏</span></label>${adm?`<button class="sbtn ghost" data-a="edit" data-id="${d.id}" style="padding:0 10px" title="Редактировать" aria-label="Редактировать">✎</button>`:''}${av?`<button class="sw ${d.avail?'on':''}" data-a="avail" data-id="${d.id}" aria-label="Наличие: ${esc(d.n.ru)}"></button>`:''}</div>`).join('')}</div>`}).join('')}
  ${adm&&del.length?`<div class="lbl">Удалённые блюда <small>${del.length}</small></div><div class="stop">${del.map(d=>`<div class="si off"><div class="nm"><b>${esc(d.n.ru)}</b><small>Удалено</small></div><button class="sbtn ghost" data-a="restoreDish" data-id="${d.id}">Восстановить</button></div>`).join('')}</div>`:''}`}
function tableURL(n){return siteBase()+'#table-'+n+'-'+((S.tables||{})[n]||'')}
function sTables(){const n=S.settings.tablesN;if(isAdmin()){let ch=false;S.tables=S.tables||{};for(let i=1;i<=n;i++)if(!S.tables[i]){S.tables[i]=Math.random().toString(36).slice(2,8);ch=true}if(ch)setTimeout(()=>commit(true),0)}
  return `<div class="panel" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:240px"><h4>QR-коды столов</h4><p class="s" style="margin:0">У каждого стола свой код с защитным ключом — заказ «на стол» нельзя отправить из дома. Если табличку сфотографировали и злоупотребляют — «Новый ключ», и старый QR перестаёт работать.</p></div>
  <button class="sbtn gold" data-a="printQR">🖨 Печать QR-табличек</button><label style="display:flex;gap:8px;align-items:center;font-size:13px">Столов: <input type="number" min="1" max="60" value="${n}" data-a="tablesN" style="width:70px;height:38px;border-radius:10px;border:1px solid var(--line2);background:transparent;text-align:center"></label></div>
  <div class="qrg">${Array.from({length:n},(_,i)=>i+1).map(i=>`<div class="qrc">${(st=>`<div class="tstat ${st.busy?'busy':''}">${st.busy?'Занят'+(st.sum?' · '+fmt(st.sum):'')+(st.calls?' · вызов':''):'Свободен'}</div>`)(tableState(i))}<div class="lg">AMORA</div><div class="q" id="qr${i}"></div><div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.6">Стол</div><div class="tn">${i}</div><small>Меню · заказ · официант · счёт</small><button class="sbtn" data-a="opentable" data-n="${i}">Открыть как гость →</button>${isAdmin()?`<button class="sbtn" data-a="newKey" data-n="${i}" title="Старый QR перестанет работать">Новый ключ</button>`:''}</div>`).join('')}</div>`}
function drawQRs(){if(!window.QRCode){document.querySelectorAll('.qrc .q').forEach(e=>e.innerHTML='<div style="width:140px;height:140px;border:2px dashed #999;display:grid;place-items:center;font-size:11px">QR</div>');return}
  for(let i=1;i<=S.settings.tablesN;i++){const el=$('#qr'+i);if(el&&!el.childNodes.length){try{new QRCode(el,{text:tableURL(i),width:140,height:140,colorDark:'#17140f',colorLight:'#F3EDE2',correctLevel:QRCode.CorrectLevel.M})}catch(e){}}}}
function sBook(){const list=[...S.bookings].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  return `<div style="max-width:860px">${list.length?list.map(b=>`<div class="bk"><div><b>${esc(b.name)}</b><br><a href="tel:${esc(b.phone)}" style="color:var(--gold2);font-size:12.5px">${esc(b.phone)}</a><div class="bkm">${new Date(b.date).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})} · ${esc(b.time)} · ${b.guests} гост.</div>${b.note?`<div class="bknote">💬 ${esc(b.note)}</div>`:''}${b.orderId?`<button class="sbtn ghost" data-a="od" data-id="${b.orderId}" style="display:flex;margin-top:6px;padding:0 8px;color:var(--gold2)">🍽 Предзаказ №${b.orderN} · ${fmt(b.preSum||0)}</button>`:''}</div><div class="hide-m">${new Date(b.date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})} · <b>${esc(b.time)}</b></div><div class="hide-m">${b.guests} гост.</div>
  <div style="display:flex;gap:6px">${b.status==='new'?`<button class="sbtn ghost" data-a="bk" data-v="no" data-id="${b.id}">Отказ</button><button class="sbtn ok" data-a="bk" data-v="ok" data-id="${b.id}">Подтвердить</button>`:`<span style="color:${b.status==='ok'?'var(--ok)':'var(--bad)'};font-size:13px;font-weight:600">${b.status==='ok'?'✓ Подтверждена':'Отклонена'}</span>`}</div></div>`).join(''):'<div class="panel"><h4>Броней пока нет</h4></div>'}</div>`}
function sReviews(){const r=S.orders.filter(o=>o.rating).sort((a,b)=>b.ts-a.ts);setTimeout(()=>{let ch=false;r.forEach(o=>{if(!o.rSeen){o.rSeen=1;ch=true}});if(ch)commit(true)},1500);
  const avg=r.length?(r.reduce((s,o)=>s+o.rating,0)/r.length).toFixed(1):'—';
  return `<div class="kpis" style="grid-template-columns:repeat(2,1fr);max-width:560px"><div class="kpi"><small>Средняя оценка</small><b>${avg} ★</b></div><div class="kpi"><small>Отзывов</small><b>${r.length}</b></div></div>
  <div style="max-width:760px">${r.map(o=>`<div class="rv"><div style="display:flex;justify-content:space-between;gap:10px"><span class="st">${'★'.repeat(o.rating)}${'☆'.repeat(5-o.rating)}</span><small style="color:var(--dim)">№${o.n} · ${typeLabel(o)} · ${ago(o.ts)}</small></div>${o.review?`<p>«${esc(o.review)}»</p>`:''}</div>`).join('')||'<div class="panel"><h4>Отзывов пока нет</h4><p class="s">После завершения заказа гость может поставить оценку и написать отзыв.</p></div>'}</div>`}
function sSet(){const s=S.settings;const sw=(k,l,d)=>`<div class="setrow"><div><b>${l}</b><small>${d}</small></div><button class="sw ${s[k]?'on':''}" data-a="setb" data-k="${k}"></button></div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px;align-items:start">
  <div class="panel"><h4>Приём заказов</h4><p class="s">Можно в один клик остановить любой канал — гости увидят это на сайте.</p>
  ${sw('delivery','Доставка','Заказы с адресом')}${sw('pickup','Самовывоз','Гость забирает сам')}${sw('tables','Заказ со столов','Через QR в зале')}
  <div class="setrow"><div><b>Загрузка кухни</b><small>Добавляет минуты ко времени ожидания</small></div><div style="display:flex;gap:4px">${[0,15,30,45].map(m=>`<button class="sbtn ${+s.extra===m?'pri':''}" data-a="extra" data-v="${m}" style="height:34px;padding:0 10px">${m?'+'+m:'Норма'}</button>`).join('')}</div></div></div>
  <div class="panel"><h4>Предложение недели</h4><p class="s">Баннер над меню на трёх языках.</p>
  ${sw2('promoOn','Показывать баннер',s.promo.on)}
  ${['ru','hy','en'].map(l=>`<div class="fld" style="margin-top:8px"><label>${l.toUpperCase()}</label><input data-a="promo" data-l="${l}" value="${esc(s.promo[l]||'')}"></div>`).join('')}</div>
  <div class="panel"><h4>Доставка</h4><p class="s">Зоны и стоимость по Капану и пригороду.</p>
  ${s.zones.map((z,i)=>`<div class="setrow"><b>${z.ru}</b><input data-a="zone" data-i="${i}" value="${z.fee}" inputmode="numeric"></div>`).join('')}
  <div class="setrow"><div><b>Бесплатно от</b></div><input data-a="setn" data-k="freeFrom" value="${s.freeFrom}" inputmode="numeric"></div>
  <div class="setrow"><div><b>Минимальный заказ</b></div><input data-a="setn" data-k="minOrder" value="${s.minOrder}" inputmode="numeric"></div>
  <div class="setrow"><div><b>Обслуживание в зале, %</b><small>Добавляется к заказам со столов и предзаказам к брони. Доставка и самовывоз — без процента.</small></div><input data-a="setn" data-k="svc" value="${s.svc??10}" inputmode="numeric" style="width:90px"></div>
  <div class="fld" style="margin-top:10px"><label>Курьеры (через запятую)</label><input data-a="couriers" value="${esc(s.couriers.join(', '))}"></div></div>
  <div class="panel"><h4>Часы работы</h4><p class="s">Вне часов работы сайт принимает только предзаказ ко времени.</p>
  <div class="setrow"><b>Открытие</b><input data-a="sett" data-k="open" value="${esc(s.open)}"></div><div class="setrow"><b>Закрытие</b><input data-a="sett" data-k="close" value="${esc(s.close)}"></div></div>
  <div class="panel"><h4>Уведомления</h4><p class="s">Как персонал узнаёт о заказах.</p>
  <div class="setrow"><div><b>Звук в панели</b><small>Сигнал на каждый новый заказ и вызов</small></div><button class="sbtn" data-a="testding">Проверить</button></div>
  ${sw('repeat','Повторять сигнал','Каждые 8 секунд, пока заказ или вызов не приняли')}
  <div class="setrow"><div><b>Push на телефоны официантов</b><small>Даже если панель закрыта</small></div><span class="sw on"></span></div>
  <div class="setrow"><div><b>Telegram-бот ресторана</b><small>Дубль заказов в рабочий чат</small></div><span class="sw on"></span></div></div>
  ${LIVE?'':`<div class="panel"><h4>Демо</h4><p class="s">Вернуть демонстрационные данные к исходным.</p><button class="sbtn" data-a="reset">Сбросить демо</button></div>`}</div>`}
function sw2(a,l,on){return `<div class="setrow"><b>${l}</b><button class="sw ${on?'on':''}" data-a="${a}"></button></div>`}
/* ---- staff modals: editor + receipt ---- */
function openModal(m){view.smodal=m;view.sheet=null;renderModal();$('#sheet').classList.add('on');$('#ov').classList.add('on')}
function tableState(n){const os=S.orders.filter(o=>o.type==='table'&&o.table===n&&!o.closed&&o.status!=='cancel');const cs=S.calls.filter(c=>c.table===n&&!c.done);return {busy:os.length>0||cs.length>0,sum:os.reduce((s,o)=>s+o.total,0),calls:cs.length,orders:os.length}}
function renderModal(){const m=view.smodal;if(!m)return;const el=$('#sheet');
  if(m.kind==='order'||m.kind==='cancel'||m.kind==='pay'){const o=findOrder(m.id);if(!o){closeAll();return}el.classList.add('wide');el.innerHTML=m.kind==='order'?orderModal(o):m.kind==='cancel'?cancelModal(o):payModal(o,m.finish);return}
  el.classList.remove('wide');
  if(m.kind==='privacy'){el.innerHTML=`<div class="c pvm"><div class="mh"><h3>${t('privacy')}</h3><button class="x" data-a="closeAll" aria-label="✕">✕</button></div>${t('pv').map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;return}
  if(m.kind==='pick'){const n=S.settings.tablesN;
    el.innerHTML=`<div class="c"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:30px">Выберите стол</h3><button class="x" data-a="closeAll">✕</button></div>
    <p style="color:var(--mute);font-size:13.5px;margin:6px 0 16px">Демо: нажмите на стол — как будто гость сел за него и отсканировал QR-код на табличке. В жизни выбирать ничего не нужно: камера телефона → QR → сразу «Ваш стол №…».</p>
    <div class="tpick">${Array.from({length:n},(_,i)=>i+1).map(i=>{const st=tableState(i);return `<button class="${st.busy?'busy':''} ${view.mode==='table'&&view.table===i?'cur':''}" data-a="seat" data-n="${i}"><b>${i}</b><small>${st.busy?'занят':'свободен'}</small></button>`}).join('')}</div>
    <p style="color:var(--dim);font-size:12px;margin-top:14px"><i class="tdot busy"></i> занят — есть заказ или вызов · <i class="tdot"></i> свободен</p></div>`;return}
  if(m.kind==='rcpt'){const o=S.orders.find(o=>o.id===m.id);
    el.innerHTML=`<div class="c"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h3 style="font-size:26px">Чек №${o.n}</h3><button class="x" data-a="closeAll">✕</button></div>
    <div class="rcpt"><div class="c big">AMORA</div><div class="c">café · bar · lounge · Капан</div><div class="c">ул. Р. Меликяна 6/6 · ${esc(CONTACT.phone)}</div><hr><div class="r"><span>Заказ №${o.n}</span><span>${dt(o.ts)}</span></div><div>${typeLabel(o)}</div>${o.name?`<div>${esc(o.name)} ${esc(o.phone)}</div>`:''}${o.street?`<div>${esc(o.street)}${o.apt?', '+esc(o.apt):''}</div>`:''}<hr>
    ${depsOf(o).map(d=>`${depsOf(o).length>1?`<div class="rh">${DEPS[d].ru.toUpperCase()}</div>`:''}${o.items.filter(i=>itemDep(i)===d).map(i=>`<div class="r"><span>${i.q}× ${esc(itemName(i,'ru'))}</span><span>${(i.p*i.q).toLocaleString('ru-RU')}</span></div>`).join('')}`).join('')}
    ${o.fee?`<div class="r"><span>Доставка</span><span>${o.fee}</span></div>`:''}${o.svc&&o.svc.amt?`<div class="r"><span>Обслуживание ${o.svc.pct}%</span><span>${o.svc.amt}</span></div>`:''}<hr><div class="r big"><span>ИТОГО</span><span>${o.total.toLocaleString('ru-RU')} ֏</span></div>
    <div>Оплата: ${payRu(o)}${o.paid?' — оплачено':' — не оплачено'}</div>${o.note?`<hr><div>Комментарий: ${esc(o.note)}</div>`:''}<hr><div class="c">Спасибо, что выбрали AMORA!</div></div>
    <div class="mact"><button class="sbtn ghost" data-a="od" data-id="${o.id}">← К заказу</button><div class="sp"></div><button class="sbtn gold" data-a="printRcpt">🖨 Печать</button></div></div>`;return}
  if(m.kind==='edit'){const isNew=!m.id;const d=isNew?null:DMAP[m.id];const e=view.edit;
    el.innerHTML=`<div class="c ed"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><h3 style="font-size:28px">${isNew?(catDep(e.c)==='bar'?'Новый напиток · Бар':'Новое блюдо · Кухня'):'Редактирование · '+DEPS[catDep(e.c)].ru}</h3><button class="x" data-a="closeAll">✕</button></div>
    <form id="edf"><div class="phbox"><div class="pv">${e.img?`<img class="ph" src="${e.img}">`:(d?art({...d,img:null}):'<span style="color:var(--dim);font-size:12px">Фото</span>')}</div><div><span class="sbtn upl">📷 Загрузить фото<input type="file" accept="image/*" id="edimg"></span>${e.img?` <button type="button" class="sbtn ghost" data-a="edNoImg">Убрать</button>`:''}<p style="color:var(--dim);font-size:11.5px;margin-top:6px">С телефона или компьютера — сжимается автоматически</p></div></div>
    <div class="row3"><div class="fld"><label>Название RU</label><input name="nru" value="${esc(e.n.ru)}"></div><div class="fld"><label>Название HY</label><input name="nhy" value="${esc(e.n.hy)}"></div><div class="fld"><label>Название EN</label><input name="nen" value="${esc(e.n.en)}"></div></div>
    <div class="fld" style="margin-top:10px"><label>Описание RU</label><input name="dru" value="${esc(e.d.ru)}"></div><div class="fld"><label>Описание HY</label><input name="dhy" value="${esc(e.d.hy)}"></div><div class="fld"><label>Описание EN</label><input name="den" value="${esc(e.d.en)}"></div>
    <div class="row3"><div class="fld"><label>Цена, ֏</label><input name="p" inputmode="numeric" value="${e.p}"></div><div class="fld"><label>Выход</label><input name="w" inputmode="numeric" value="${e.w}"></div><div class="fld"><label>Ед.</label><select name="u"><option value="g" ${e.u==='g'?'selected':''}>г</option><option value="ml" ${e.u==='ml'?'selected':''}>мл</option></select></div></div>
    <div class="fld" style="margin-top:10px"><label>Категория</label><select name="c">${CATS.filter(c=>c.dep===catDep(e.c)).map(c=>`<option value="${c.id}" ${e.c===c.id?'selected':''}>${c.ru}</option>`).join('')}</select></div>
    <div class="tg">${['hit','new','veg','spicy'].map(tg=>`<label><input type="checkbox" name="tag" value="${tg}" ${e.tags.includes(tg)?'checked':''}> ${T.ru[tg]}</label>`).join('')}<label><input type="checkbox" name="hidden" ${e.hidden?'checked':''}> Скрыть с сайта</label></div>
    <div style="display:flex;gap:10px;margin-top:18px">${!isNew?`<button type="button" class="sbtn ghost danger" data-a="edDel">Удалить блюдо</button>`:''}<div class="sp"></div><button type="button" class="sbtn" data-a="closeAll">Отмена</button><button type="submit" class="sbtn gold">Сохранить</button></div></form></div>`;
    $('#edimg').onchange=ev=>{const f=ev.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const mx=640,k=Math.min(1,mx/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=im.width*k;cv.height=im.height*k;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);syncEdit();view.edit.img=cv.toDataURL('image/jpeg',.78);renderModal()};im.src=rd.result};rd.readAsDataURL(f)};
    $('#edf').onsubmit=ev=>{ev.preventDefault();saveEdit()}}
}
function syncEdit(){const f=$('#edf');if(!f)return;const fd=new FormData(f),e=view.edit;e.n={ru:fd.get('nru'),hy:fd.get('nhy'),en:fd.get('nen')};e.d={ru:fd.get('dru'),hy:fd.get('dhy'),en:fd.get('den')};e.p=parseInt(fd.get('p'))||0;e.w=parseInt(fd.get('w'))||0;e.u=fd.get('u');e.c=fd.get('c');e.tags=fd.getAll('tag');e.hidden=!!fd.get('hidden')}
function startEdit(id){const d=id?DMAP[id]:null;view.edit=d?{n:{...d.n},d:{...d.d},p:d.p,w:d.w,u:d.u,c:d.c,tags:[...(d.tags||[])],hidden:d.hidden,img:d.img||null}:{n:{ru:'',hy:'',en:''},d:{ru:'',hy:'',en:''},p:0,w:0,u:(view.menuDep==='bar'?'ml':'g'),c:CATS.find(c=>c.dep===(view.menuDep||'kitchen')).id,tags:[],hidden:false,img:null};openModal({kind:'edit',id})}
function saveEdit(){syncEdit();const e=view.edit,m=view.smodal;if(!e.n.ru.trim()||!e.p){toast('Укажите название и цену');return}
  ['hy','en'].forEach(l=>{if(!e.n[l])e.n[l]=e.n.ru;if(!e.d[l])e.d[l]=e.d.ru});
  let id=m.id;if(!id){id='x'+now().toString(36);S.added=S.added||[];S.added.push({id,c:e.c,p:e.p,w:e.w,u:e.u,tags:[],n:e.n,d:e.d})}
  S.menu[id]=Object.assign(S.menu[id]||{avail:true},{n:e.n,d:e.d,p:e.p,w:e.w,u:e.u,c:e.c,dep:catDep(e.c),tags:e.tags,hidden:e.hidden,img:e.img||null});const ad=(S.added||[]).find(a=>a.id===id);if(ad)ad.c=e.c;
  logA(m.id?'Позиция изменена':'Позиция добавлена',DEPS[catDep(e.c)].ru+' · '+e.n.ru+' · '+e.p+' ֏');closeAll();commit();toast(m.id?'Блюдо обновлено на сайте':'Блюдо добавлено на сайт')}

/* ================= TOUR ================= */
function staffTab(k){if(!staffUser)staffUser=S.staff.find(x=>x.role==='admin')||{id:'u1',name:'Администратор',role:'admin'};staffAuthed=true;view.staffTab=k;if(view.mode!=='staff')go('staff');else{closeAll();renderStaff();window.scrollTo(0,0)}}
function tourOrder(){go('');setTimeout(()=>{if(!cartCount()){addCart('fried-potatoes-with-pork',2);addCart('tolma',1);addCart('greek-salad',1)}
  Object.assign(view.form,{name:view.form.name||'Гость (демо)',phone:view.form.phone||'+374 77 00 00 00',street:view.form.street||'ул. Шаумяна 1',when:isOpen()?'asap':'later',time:view.form.time||'20:00'});view.ctype='delivery';
  view.drawer='cart';$('#drawer').classList.add('on');$('#ov').classList.add('on');placeOrder()},150)}
const TOUR=[
 {t:'Меню, которым управляет ресторан',d:'Три языка, поиск и фильтры. Если блюдо закончилось, ресторан выключает его в панели — гость сразу видит «Сегодня нет» и не может его заказать.',go:()=>{go('');setTimeout(()=>window.scrollTo({top:$('#mnav').offsetTop-66,behavior:'smooth'}),150)}},
 {t:'Карточка блюда',d:'Настоящее фото, состав на трёх языках и варианты порции — например, крылья 6 или 8 штук: цена пересчитывается сама.',go:()=>{go('');setTimeout(()=>openSheet('crispy-chicken-wings'),180)}},
 {t:'Корзина и оформление',d:'Доставка или самовывоз, зоны по Капану, бесплатная доставка от суммы, наличные со сдачей или карта через терминал. Без регистрации — данные гостя запоминаются на его телефоне.',go:()=>{go('');setTimeout(()=>{if(!cartCount()){addCart('fried-potatoes-with-pork',2);addCart('tolma',1);addCart('greek-salad',1)}view.step='checkout';openDrawer('cart')},180)}},
 {t:'Статус заказа в реальном времени',d:'Отправляем заказ. Гость видит, что происходит: принят → готовится → курьер в пути. Статус меняется сам, когда ресторан нажимает кнопку.',go:tourOrder},
 {t:'Рейтинг гостей',d:'Каждый заказ с номером телефона приносит баллы. Топ месяца получает скидку на весь следующий месяц: 15%, 10%, 7%, 5%. Без аккаунтов и паролей — только номер.',go:()=>{go('');setTimeout(()=>{const r=$('#rating');if(r)window.scrollTo({top:r.offsetTop-70,behavior:'smooth'});const c=ranking(prevYm())[2];const f=$('#lookf');if(f&&c){f.phone.value=c.phone;$('#rres').innerHTML=lookupHTML(c.phone)}},200)}},
 {t:'Скидка применяется сама',d:'Гость вводит номер при заказе — сайт узнаёт его место в рейтинге прошлого месяца и сразу считает скидку. И показывает, сколько баллов принесёт этот заказ.',go:()=>{go('');setTimeout(()=>{if(!cartCount()){addCart('fried-potatoes-with-pork',2);addCart('tolma',1);addCart('greek-salad',1)}const c=ranking(prevYm())[1];if(c)Object.assign(view.form,{name:c.name,phone:c.phone,street:view.form.street||'ул. Абовяна 7'});view.step='checkout';openDrawer('cart')},200)}},
 {t:'Заказ со столика по QR',d:'Гость сканирует код на столе: меню, заказ на кухню, вызов официанта и счёт — с телефона. Заказать «на стол» из дома нельзя — в коде защитный ключ.',go:()=>go('table-5')},
 {t:'Панель ресторана',d:'Новые заказы приходят со звуком, который повторяется, пока заказ не приняли. Принять, отклонить с причиной, передать курьеру, чек — в один клик.',go:()=>{staffTab('orders');setTimeout(fakeOrder,500)}},
 {t:'Авто-статус «Готовится»',d:'Официант принимает заказ — через 5 минут он сам переходит в «Готовится», гость видит это на сайте. Готово — одна кнопка.',go:()=>{if(!S.orders.some(o=>o.status==='cooking')){const o=S.orders.find(o=>o.status==='new');if(o){o.status='cooking';o.hist.cooking=now();commit(true)}}staffTab('orders')}},
 {t:'Меню, стоп-лист и фото',d:'Выключить блюдо, поменять цену, название, описание, загрузить фото с телефона, добавить новое блюдо — всё делает сам ресторан, без программиста.',go:()=>staffTab('stop')},
 {t:'Гости и рейтинг в панели',d:'База гостей по номерам телефонов, рейтинг месяца, кто сейчас со скидкой, начисление баллов на кассе для тех, кто платит в зале. Условия программы меняются в один клик.',go:()=>staffTab('guests')},
 {t:'Telegram-бот',d:'Каждый заказ, вызов стола и бронь дублируются в рабочий чат. Гость может следить за статусом заказа в Telegram — без приложения и регистрации — и проверить своё место в рейтинге.',go:()=>staffTab('tg')},
 {t:'Роли сотрудников',d:'Администратор, официант, кухня, курьер — каждый видит только своё. У каждого личный вход; уволенному доступ отключается сразу.',go:()=>staffTab('team')},
 {t:'QR-коды столов',d:'Готовые к печати таблички для каждого стола. Количество столов меняется в одну цифру.',go:()=>staffTab('tables')},
 {t:'Статистика и отзывы',d:'Выручка, средний чек, топ блюд, каналы продаж и оценки гостей после каждого заказа.',go:()=>staffTab('stats')},
];
function renderTour(){const el=$('#tour');if(!el)return;if(view.tour===null){el.innerHTML='';return}
  if(view.tourMin){el.innerHTML=`<button class="tourmin" data-a="tourMax">Тур · ${view.tour+1}/${TOUR.length} ▴</button>`;return}
  const s=TOUR[view.tour];
  el.innerHTML=`<div class="tour"><div class="k"><span>Тур по возможностям · ${view.tour+1}/${TOUR.length}</span><span><button data-a="tourMin" title="Свернуть">▾</button><button data-a="tourX" title="Закрыть">✕</button></span></div><h4>${s.t}</h4><p>${s.d}</p>
  <div class="nav"><button data-a="tourGo" data-v="-1" ${view.tour?'':'disabled style="opacity:.3"'}>←</button><div class="pg">${TOUR.map((_,i)=>`<i class="${i<=view.tour?'on':''}"></i>`).join('')}</div>${view.tour<TOUR.length-1?`<button class="pri" data-a="tourGo" data-v="1">Дальше →</button>`:`<button class="pri" data-a="tourX">Готово</button>`}</div></div>`}
function tourStep(i){view.tour=i;view.tourMin=false;renderTour();try{TOUR[i].go()}catch(e){}}

/* ================= DEMO SWITCHER ================= */
function renderDemo(){if(!$('#demo'))return;const unseen=S.orders.some(o=>o.status==='new')||S.calls.some(c=>!c.done);
  $('#demo').innerHTML=`<span>Демо</span><button class="${view.mode==='guest'?'on':''}" data-a="dm" data-v="">Сайт</button><button class="${view.mode==='table'?'on':''}" data-a="pickTable">${view.mode==='table'?'Стол '+view.table:'Стол'} · QR</button><button class="${view.mode==='staff'?'on':''}" data-a="dm" data-v="staff">Ресторан${unseen&&view.mode!=='staff'?'<i class="rd"></i>':''}</button>${view.tour===null?`<button class="tb" data-a="tour">Тур ▸</button>`:''}`}
function renderAll(){if(view.mode==='staff')staffAlerts();document.documentElement.lang=L.lang;if(view.mode!=='staff'&&ENTRY!=='admin'){document.title=t('seoTitle');const md=document.querySelector('meta[name=description]');if(md)md.setAttribute('content',t('seoText'))}view.mode==='staff'?renderStaff():renderGuest();renderDemo();renderTour();if(view.drawer)renderDrawer();if(view.sheet)renderSheet()}
function closeAll(){view.drawer=null;view.sheet=null;view.smodal=null;$('#drawer').classList.remove('on');$('#sheet').classList.remove('on');$('#ov').classList.remove('on')}
function openDrawer(kind){view.drawer=kind;view.sheet=null;view.smodal=null;$('#sheet').classList.remove('on');renderDrawer();$('#drawer').classList.add('on');$('#ov').classList.add('on')}

/* ================= LOYALTY (рейтинг гостей) ================= */
function ym(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function prevYm(){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return ym(d)}
const HYM=['հունվար','փետրվար','մարտ','ապրիլ','մայիս','հունիս','հուլիս','օգոստոս','սեպտեմբեր','հոկտեմբեր','նոյեմբեր','դեկտեմբեր'];
function monthName(m,lang){const [y,mm]=m.split('-').map(Number);const lg=lang||L.lang;if(lg==='hy')return HYM[mm-1];const loc={ru:'ru-RU',en:'en-US'}[lg]||'ru-RU';try{return new Date(y,mm-1,1).toLocaleString(loc,{month:'long'})}catch(e){return m}}
function dayLabel(iso){const d=new Date(iso+'T00:00');if(L.lang==='hy')return d.getDate()+' '+HYM[d.getMonth()]+'ի';return d.toLocaleDateString(L.lang==='en'?'en-GB':'ru-RU',{day:'numeric',month:'long'})}
function normPhone(p){let d=String(p||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.length===9&&d[0]==='0')d='374'+d.slice(1);else if(d.length===8)d='374'+d;return d.length===11&&d.startsWith('374')?'+'+d:null}
function cyrb53(str,seed){seed=seed||0;let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507);h1^=Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507);h2^=Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function cid(p){return 'c'+cyrb53(normPhone(p)||String(p||''))}
function maskPhone(p){const n=normPhone(p);return n?n.slice(0,4)+' ·· ·· '+n.slice(-2):''}
function ranking(month){return Object.entries(S.customers||{}).map(([id,c])=>({id,...c,score:(c.pts&&c.pts[month])||0})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score)}
function tierFor(pos){const lo=S.settings.loyalty;if(!lo)return 0;const x=(lo.tiers||[]).find(x=>pos>=x.from&&pos<=x.to);return x?x.pct:0}
function custInfo(phone){const id=cid(phone);const c=(S.customers||{})[id];const cur=ranking(ym()),prev=ranking(prevYm());const pc=cur.findIndex(x=>x.id===id),pp=prev.findIndex(x=>x.id===id);return {id,c,curPos:pc+1,curPts:pc>=0?cur[pc].score:0,prevPos:pp+1,disc:S.settings.loyalty&&S.settings.loyalty.on&&pp>=0?tierFor(pp+1):0}}
function discFor(phone){if(!S.settings.loyalty||!S.settings.loyalty.on)return null;const n=normPhone(phone);if(!n)return null;const li=custInfo(n);return li.disc?{pct:li.disc,rank:li.prevPos,month:prevYm()}:null}
function award(o){const lo=S.settings.loyalty;if(!lo||!lo.on||o.awarded||!o.phone)return;const n=normPhone(o.phone);if(!n)return;S.customers=S.customers||{};
  const id=cid(n);const m=ym(new Date(o.ts||now()));const c=S.customers[id]||{name:o.name||'Гость',phone:n,masked:maskPhone(n),pts:{},orders:0,spent:0};
  const p=Math.floor((o.total||0)/(lo.per||100))+(+lo.visit||0);c.pts=c.pts||{};c.pts[m]=(c.pts[m]||0)+p;c.orders=(c.orders||0)+1;c.spent=(c.spent||0)+(o.total||0);c.last=now();if(o.name&&o.name!=='Гость')c.name=o.name;c.masked=maskPhone(n);c.phone=n;S.customers[id]=c;o.awarded=p}
function seedCustomers(s){const cur=ym(),prev=prevYm();const r=rnd('cust7');
  const pre=[['Арам','+37477123456'],['Гость','+37493000001'],['Давид','+37455102030'],['Ани','+37491405060']];
  const names=['Нарек','Мариам','Тигран','Анна','Гор','Сона','Арсен','Нарине','Карен','Мане','Ашот','Гаяне','Самвел','Ева','Рубен','Астхик','Ваге','Лусине','Эрик','Седа','Артур','Кристина','Левон','Зара'];
  const ops=['77','91','93','94','95','96','98','99','55','41','43','33'];
  const list=pre.concat(names.map((n,i)=>[n,'+374'+ops[i%ops.length]+String(Math.floor(r()*1e6)).padStart(6,'0')]));
  const order=list.map((_,i)=>i).sort((a,b)=>rnd('o'+a)()-rnd('o'+b)());
  s.customers={};
  list.forEach(([name,phone],i)=>{const pi=order.indexOf(i);const pp=pi<26?Math.round(2900-pi*95-r()*40):0;const cp=r()<.8?Math.round(150+r()*1300):0;const on=Math.max(1,Math.round((pp+cp)/450));
    s.customers[cid(phone)]={name,phone,masked:maskPhone(phone),pts:Object.assign({},pp?{[prev]:pp}:{},cp?{[cur]:cp}:{}),orders:on,spent:Math.max(5000,Math.round((pp+cp-on*20)/10)*1000),last:now()-Math.floor(r()*20)*864e5}})}
function ratingHTML(){const lo=S.settings.loyalty;if(!lo||!lo.on)return '';const cur=ranking(ym());
  return `<section class="wrap rating" id="rating"><div class="rhead"><div><div class="eyebrow">${t('rtEyebrow')}</div><h2>${t('rtTitle')}</h2><p class="lead2">${t('rtLead')}</p></div>
  <div class="tiers">${lo.tiers.map(x=>`<div class="tier"><b>−${x.pct}%</b><span>${x.from===x.to?'#'+x.from:'#'+x.from+'–'+x.to}</span></div>`).join('')}</div></div>
  <div class="rgrid"><div class="board"><div class="bh"><span>${t('rtBoard')} · ${monthName(ym())}</span><span class="live2"><i class="dot"></i>live</span></div>
  ${cur.length?podium(cur.slice(0,3)):`<p style="color:var(--mute);padding:40px 0;text-align:center">${t('rtEmpty')}</p>`}
  <ol class="rlist">${cur.slice(3,10).map((c,i)=>`<li><span class="pos">${i+4}</span><span class="nm">${esc(c.name)} <small>${esc(c.masked)}</small></span><b>${c.score}</b></li>`).join('')}</ol></div>
  <div class="rside"><div class="steps3">${[1,2,3].map(i=>`<div><em>0${i}</em><b>${t('rs'+i)}</b><p>${t('rs'+i+'s').replace('{per}',lo.per).replace('{visit}',lo.visit).replace('{top}',Math.max(...lo.tiers.map(x=>x.to)))}</p></div>`).join('')}</div>
  <form class="lookup" id="lookf"><label>${t('rtCheck')}</label><div class="lrow"><input name="phone" type="tel" placeholder="+374 __ __ __ __" value="${esc(L.prof.phone||'')}"><button class="btn gold" type="submit">${t('rtFind')}</button></div><div id="rres"></div></form></div></div></section>`}
function podium(top){return `<div class="podium">${[1,0,2].map(i=>top[i]?`<div class="pd p${i+1}"><div class="av">${esc((top[i].name||'?')[0])}</div><b>${esc(top[i].name)}</b><small>${esc(top[i].masked)}</small><div class="col"><span>${i+1}</span><em>${top[i].score} ${t('pts')}</em></div></div>`:'<div></div>').join('')}</div>`}
function lookupHTML(phone){const n=normPhone(phone);if(!n)return `<p class="warnt">${t('fillPhone')}</p>`;const li=custInfo(n);
  if(!li.c)return `<div class="rcard"><b>${t('rtNone')}</b><p>${t('rtNoneS')}</p></div>`;
  const cur=ranking(ym());let next='';if(li.curPos>1){const tg=cur[li.curPos-2];next=t('rtToNext').replace('{n}',tg.score-li.curPts+1).replace('{p}',li.curPos-1)}
  return `<div class="rcard"><div class="rc1"><span class="big">#${li.curPos||'—'}</span><div><b>${esc(li.c.name)}</b><small>${li.curPts} ${t('pts')} · ${monthName(ym())}</small></div></div>
  ${li.disc?`<div class="disc">−${li.disc}% <small>${t('rtYourDisc')} (#${li.prevPos} · ${monthName(prevYm())})</small></div>`:`<p>${t('rtNoDisc')}</p>`}
  ${next?`<p>${next}</p>`:''}<button type="button" class="linkbtn" data-a="tgVerify">${t('rtTg')} →</button></div>`}
function sumHTML(){const tbl=view.mode==='table';const sub=cartSub();const ph=tbl?view.form.tphone:view.form.phone;const d=discFor(ph);const da=d?Math.round(sub*d.pct/100):0;const fe=fee();const lo=S.settings.loyalty;
  const earn=lo&&lo.on&&normPhone(ph)?Math.floor((sub-da+fe)/lo.per)+(+lo.visit||0):0;
  return `<div class="sumrow"><span>${t('items')}</span><span>${fmt(sub)}</span></div>${d?`<div class="sumrow dsc"><span>${t('discL')} −${d.pct}% <small>(#${d.rank} · ${monthName(d.month)})</small></span><span>−${fmt(da)}</span></div>`:''}${!tbl&&view.ctype==='delivery'?`<div class="sumrow"><span>${t('delivery')}</span><span>${fe?fmt(fe):t('free')}</span></div>`:''}${tbl&&svcOf(sub-da)?`<div class="sumrow"><span>${t('svc')} ${svcPct()}%</span><span>${fmt(svcOf(sub-da))}</span></div>`:''}<div class="sumrow t"><span>${t('total')}</span><span>${fmt(sub-da+fe+(tbl?svcOf(sub-da):0))}</span></div>${earn?`<div class="earn">+${earn} ${t('pts')} ${t('willEarn')}</div>`:''}`}
let pcT=null;function phoneChanged(){clearTimeout(pcT);pcT=setTimeout(async()=>{const ph=view.mode==='table'?view.form.tphone:view.form.phone;const n=normPhone(ph);if(n&&BK&&BK.fetchCustomer){try{await BK.fetchCustomer(cid(n))}catch(e){}}const sb=$('#sumbox');if(sb)sb.innerHTML=sumHTML()},250)}

/* ================= TELEGRAM ================= */
function stLabelRu(o){const s=L.lang;L.lang='ru';const r=stLabel(o);L.lang=s;return r}
function tgMsg(to,html,kb,out){S.tg=S.tg||[];S.tg.push({to,html,kb:kb||null,out:!!out,ts:now()});if(S.tg.length>80)S.tg=S.tg.slice(-80)}
function notify(ev,id){
  if(LIVE){if(CFG.telegramWorker)setTimeout(()=>{try{fetch(CFG.telegramWorker.replace(/\/$/,'')+'/notify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:ev,id})}).catch(()=>{})}catch(e){}},1500);return}
  const e=esc;
  if(ev==='order'){const o=S.orders.find(o=>o.id===id);if(!o)return;const z=S.settings.zones.find(z=>z.id===o.zone);
    tgMsg('staff',`<b>🆕 Заказ №${o.n} · ${typeLabel(o)}</b>\n${o.type!=='table'||o.phone?`👤 ${e(o.name||'')} · ${e(o.phone||'')}\n`:''}${o.street?`📍 ${e(o.street)}${o.apt?', '+e(o.apt):''}${z?' ('+z.ru+')':''}\n`:''}${o.when==='later'?`⏰ Ко времени ${e(o.time)}\n`:''}${depsOf(o).map(d=>(depsOf(o).length>1?(d==='bar'?'🍸 <b>БАР</b>\n':'🍽 <b>КУХНЯ</b>\n'):'')+o.items.filter(i=>itemDep(i)===d).map(i=>`— ${i.q}× ${e(itemName(i,'ru'))}`).join('\n')).join('\n')}${o.note?`\n💬 ${e(o.note)}`:''}\n💰 <b>${fmt(o.total)}</b>${o.type==='table'?'':' · '+(o.pay==='card'?'карта, терминал':'наличные'+(o.change?', сдача с '+o.change:''))}${o.disc?`\n🏆 Скидка рейтинга −${o.disc.pct}% (−${fmt(o.disc.amt)})`:''}`,['Открыть в панели'])}
  if(ev==='call'){const c=S.calls.find(c=>c.id===id);if(!c)return;tgMsg('staff',c.kind==='bill'?`<b>🧾 Стол ${c.table} просит счёт</b>\nОплата: ${c.pay==='card'?'картой (терминал)':'наличными'}${c.phone?`\n🏆 Баллы на номер ${e(c.phone)}`:''}`:`<b>🔔 Стол ${c.table} зовёт официанта</b>`)}
  if(ev==='booking'){const b=S.bookings.find(b=>b.id===id);if(!b)return;tgMsg('staff',`<b>📅 Новая бронь</b>\n${e(b.name)} · ${e(b.phone)}\n${new Date(b.date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}, ${e(b.time)} · ${b.guests} гост.${b.note?'\n💬 '+e(b.note):''}${b.orderN?'\n🍽 Предзаказ №'+b.orderN+' · '+fmt(b.preSum||0):''}`,['Подтвердить','Позвонить'])}
  if(ev==='status'){const o=S.orders.find(o=>o.id===id);if(!o||!o.tgGuest)return;const ic={cooking:'👨‍🍳',ready:'✅',onway:'🛵',done:'🎉',cancel:'⚠️'}[o.status]||'•';
    tgMsg('guest',`${ic} Заказ №${o.n}: <b>${stLabelRu(o)}</b>${o.status==='onway'&&o.courier?`\nКурьер: ${e(o.courier)}`:''}${o.status==='cancel'&&o.reasonK?`\nПричина: ${REASONS.find(r=>r.k===o.reasonK).ru}`:''}${o.status==='done'&&o.awarded?`\n🏆 +${o.awarded} баллов в рейтинг гостей`:''}`)}
}

/* ================= STAFF: roles, guests, telegram, team ================= */
const ROLES={admin:{n:'Администратор',d:'Полный доступ: заказы, меню и цены, сотрудники, отчёты, настройки, журнал действий.'},manager:{n:'Менеджер',d:'Заказы, отмены и оплаты, меню: цены, фото, описания, новые блюда, стоп-лист. Брони, гости, отчёты, приём заказов. Без сотрудников и настроек.'},waiter:{n:'Официант',d:'Приём и обработка заказов, статусы, оплата, вызовы столов, брони, история.'},kitchen:{n:'Повар (кухня)',d:'Видит только блюда кухни в заказах: что готовить, количество, комментарии. Отмечает «Кухня: готово». Наличие блюд кухни.'},bar:{n:'Бармен (бар)',d:'Видит только напитки в заказах. Отмечает «Бар: готово». Наличие позиций бара.'},courier:{n:'Курьер',d:'Только доставка: забрать, доставить, отметить оплату.'}};
const TABS={dash:'Обзор',orders:'Заказы',calls:'Вызовы столов',history:'История заказов',menuK:'Кухня',menuB:'Бар',bookings:'Брони',guests:'Гости и рейтинг',tables:'Столы и QR',reviews:'Отзывы',stats:'Отчёты',tg:'Telegram',team:'Сотрудники',audit:'Журнал действий',settings:'Настройки'};
const ROLE_TABS={admin:Object.keys(TABS),manager:['dash','orders','calls','history','menuK','menuB','bookings','guests','tables','reviews','stats'],waiter:['dash','orders','calls','history','bookings','guests','tables'],kitchen:['orders','menuK'],bar:['orders','menuB'],courier:['orders']};
const canTab=k=>!!staffUser&&(ROLE_TABS[staffUser.role]||[]).includes(k);
const isAdmin=()=>!!staffUser&&staffUser.role==='admin';
const canMenu=()=>!!staffUser&&['admin','manager'].includes(staffUser.role);
const visO=o=>!staffUser||staffUser.role!=='courier'||o.type==='delivery';
function loginStaff(u){staffUser=u;staffAuthed=!!u;if(u&&!canTab(view.staffTab))view.staffTab=(ROLE_TABS[u.role]||['orders'])[0];if(u)ding();renderAll()}
function sGuests(){const lo=S.settings.loyalty;const m=ym(),pm=prevYm();const cur=ranking(m),prev=ranking(pm).slice(0,Math.max(...lo.tiers.map(x=>x.to)));
  const q=(view.gq||'').trim().toLowerCase(),qd=q.replace(/\D/g,'');
  const rows=cur.concat(Object.entries(S.customers||{}).filter(([id,c])=>!((c.pts||{})[m])).map(([id,c])=>({id,...c,score:0})));
  const list=rows.filter(c=>!q||(c.name||'').toLowerCase().includes(q)||(qd&&String(c.phone||'').replace(/\D/g,'').includes(qd))).slice(0,80);
  const discSum=S.orders.filter(o=>o.disc).reduce((s,o)=>s+o.disc.amt,0);
  return `<div class="kpis"><div class="kpi"><small>Гостей в базе</small><b>${Object.keys(S.customers||{}).length}</b></div><div class="kpi"><small>Участвуют в ${monthName(m,'ru')}</small><b>${cur.length}</b></div><div class="kpi"><small>Со скидкой сейчас</small><b>${prev.length}</b></div><div class="kpi"><small>Скидок выдано сегодня</small><b>${fmt(discSum)}</b></div></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px;align-items:start">
   <div class="panel"><h4>Начислить баллы на кассе</h4><p class="s">Для гостей, которые платят в зале без онлайн-заказа: номер телефона и сумма чека. Баллы появятся в рейтинге сразу.</p>
    <form id="manf" class="form"><div class="row2"><div class="fld"><label>Телефон</label><input name="phone" type="tel" placeholder="+374"></div><div class="fld"><label>Имя</label><input name="name"></div></div><div class="row2"><div class="fld"><label>Сумма чека, ֏</label><input name="amt" inputmode="numeric"></div><div class="fld" style="justify-content:flex-end"><button class="sbtn gold" style="height:48px" type="submit">Начислить</button></div></div></form></div>
   <div class="panel"><h4>Скидки сейчас · итоги: ${monthName(pm,'ru')}</h4><p class="s">Эти гости весь ${monthName(m,'ru')} получают скидку автоматически — при заказе на сайте, со стола или по номеру на кассе.</p>
    ${prev.slice(0,10).map((c,i)=>`<div class="setrow"><div><b>#${i+1} ${esc(c.name)}</b><small>${esc(c.phone||c.masked)}</small></div><b style="color:var(--ok)">−${tierFor(i+1)}%</b></div>`).join('')||'<p class="s">Пока нет — первый месяц работы программы.</p>'}${prev.length>10?`<p class="s" style="margin-top:8px">…и ещё ${prev.length-10} гостей</p>`:''}</div>
  </div>
  <div class="panel"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><h4 style="flex:1">Рейтинг · ${monthName(m,'ru')} · live</h4><input id="gq" placeholder="Имя или телефон" value="${esc(view.gq||'')}" style="height:38px;border-radius:10px;border:1px solid var(--line2);background:transparent;padding:0 12px"><button class="sbtn" data-a="csv">Скопировать CSV</button></div>
  <div style="overflow-x:auto"><table class="gtable"><tr><th>#</th><th>Гость</th><th>Телефон</th><th>Баллы</th><th class="hm2">Заказов</th><th class="hm2">Потрачено</th><th class="hm2">Был</th><th>Скидка в след. месяце</th></tr>
  ${list.map(c=>{const pos=c.score?cur.findIndex(x=>x.id===c.id)+1:0;return `<tr class="${pos&&pos<=3?'top':''}"><td>${pos||'—'}</td><td>${esc(c.name)}</td><td>${esc(c.phone||c.masked)}</td><td><b>${c.score}</b></td><td class="hm2">${c.orders||0}</td><td class="hm2">${fmt(c.spent||0)}</td><td class="hm2">${c.last?new Date(c.last).toLocaleDateString('ru-RU'):'—'}</td><td>${pos&&tierFor(pos)?'−'+tierFor(pos)+'%':'—'}</td></tr>`}).join('')}</table></div></div>
  ${isAdmin()?`<div class="panel"><h4>Правила программы</h4><p class="s">Меняются в любой момент — сайт сразу показывает новые условия.</p>
  ${sw2('loyOn','Программа включена',lo.on)}
  <div class="setrow"><div><b>1 балл за каждые</b><small>֏ в чеке</small></div><input data-a="loy" data-k="per" value="${lo.per}" inputmode="numeric"></div>
  <div class="setrow"><div><b>Бонус за визит</b><small>баллов за каждый заказ</small></div><input data-a="loy" data-k="visit" value="${lo.visit}" inputmode="numeric"></div>
  <div class="lbl">Скидка по месту в рейтинге прошлого месяца</div><div class="tierrow" style="color:var(--mute);font-size:11.5px"><span>С места</span><span>По место</span><span>Скидка, %</span><span></span></div>
  ${lo.tiers.map((x,i)=>`<div class="tierrow"><input data-a="tier" data-i="${i}" data-k="from" value="${x.from}" inputmode="numeric"><input data-a="tier" data-i="${i}" data-k="to" value="${x.to}" inputmode="numeric"><input data-a="tier" data-i="${i}" data-k="pct" value="${x.pct}" inputmode="numeric"><button class="sbtn ghost" data-a="tierDel" data-i="${i}">✕</button></div>`).join('')}<button class="sbtn" data-a="tierAdd">+ Уровень</button></div>`:''}`}
function sTg(){const msgs=S.tg||[];const sm=msgs.filter(x=>x.to==='staff').slice(-25),gm=msgs.filter(x=>x.to==='guest').slice(-25);
  const ph=(title,sub,arr,empty)=>`<div class="phone"><div class="th"><div class="av">A</div><div><b>${title}</b><small>${sub}</small></div></div><div class="msgs">${arr.length?arr.map(x=>`<div class="tm ${x.out?'out':''}">${x.html}${x.kb?`<div class="kb">${x.kb.map(k=>`<span>${k}</span>`).join('')}</div>`:''}<time>${hm(x.ts)}</time></div>`).join(''):`<div class="empty2">${empty}</div>`}</div></div>`;
  return `<div class="panel"><h4>Telegram-бот AMORA</h4><p class="s" style="margin:0">${LIVE?(CFG.telegramWorker?'Подключён: заказы, вызовы и брони уходят в рабочий чат, гости получают статусы.':'Не подключён: укажите адрес воркера и имя бота в config.js (инструкция в README).'):'Демо: так выглядят сообщения бота. Сделайте заказ, вызов официанта или бронь — сообщение появится слева. Гость, нажавший «Следить в Telegram», получает статусы справа.'}</p></div>
  <div class="tgwrap">${ph('AMORA · Заказы','бот · рабочий чат персонала',sm,'Здесь появятся новые заказы, вызовы и брони')}${ph('AMORA','бот · так видит гость',gm,'Гость нажал «Следить в Telegram» — сюда придут статусы его заказа и место в рейтинге')}</div>`}
function sTeam(){const admins=S.staff.filter(x=>x.role==='admin').length;
  return `<div class="roles">${Object.entries(ROLES).map(([k,r])=>`<div class="rolec"><b>${r.n}</b><p>${r.d}</p></div>`).join('')}</div>
  <div class="panel"><h4>Сотрудники</h4><p class="s">${LIVE?'Вход по e-mail и паролю. Новому сотруднику создаётся аккаунт с временным паролем — передайте его лично.':'Демо: вход по PIN-коду. В рабочей версии — e-mail и пароль для каждого сотрудника.'}</p>
  ${S.staff.map(s=>`<div class="setrow"><div><b>${esc(s.name)}</b><small>${(ROLES[s.role]||{}).n||s.role}${s.email?' · '+esc(s.email):''}${!LIVE&&s.pin?' · PIN '+esc(s.pin):''}</small></div>${s.role==='admin'&&admins<2||(staffUser&&s.id===staffUser.id)?'':`<button class="sbtn ghost" data-a="delStaff" data-id="${s.id}">Удалить</button>`}</div>`).join('')}
  <form id="stf" class="form" style="margin-top:14px"><div class="row3"><div class="fld"><label>Имя</label><input name="name"></div><div class="fld"><label>Роль</label><select name="role">${Object.entries(ROLES).map(([k,r])=>`<option value="${k}" ${k==='waiter'?'selected':''}>${r.n}</option>`).join('')}</select></div><div class="fld"><label>${LIVE?'Логин (латиницей, напр. vahan)':'PIN (4 цифры)'}</label><input name="cred" ${LIVE?'type="text" autocapitalize="none" spellcheck="false"':'inputmode="numeric" maxlength="4"'}></div></div>${LIVE?'<div class="fld"><label>Временный пароль (мин. 6 символов)</label><input name="pw"></div>':''}<button class="sbtn gold" type="submit" style="height:44px">+ Добавить сотрудника</button></form></div>`}
function siteBase(){if(CFG.siteUrl)return CFG.siteUrl.replace(/\/?$/,'/');if(ENTRY==='demo'&&!LIVE)return 'https://amora.am/';return location.origin+location.pathname.replace(/[^/]*$/,'')}

/* ================= BACKEND BRIDGE ================= */
function typing(){const a=document.activeElement;return !!(a&&a.matches&&a.matches('input,textarea,select'))}
let pendingRender=false;
document.addEventListener('focusout',()=>{if(pendingRender)setTimeout(()=>{if(!typing()&&pendingRender){pendingRender=false;renderAll()}},60)});
const API={getS:()=>S,changed(){rebuild();if(typing()){pendingRender=true;return}renderAll()},toast,myIds:()=>L.my,table:()=>view.mode==='table'?view.table:null,
  onStaff(u){if(u)loginStaff(u);else{staffAuthed=false;staffUser=null;renderAll()}}};
function introRun(){const el=$('#intro');if(!el)return;if(document.documentElement.classList.contains('no-intro')){el.remove();return}
  const dur=RM.matches?900:2700;let done=false;const end=()=>{if(done)return;done=true;el.classList.add('out');document.documentElement.classList.remove('intro-lock');setTimeout(()=>el.remove(),900)};
  document.documentElement.classList.add('intro-lock');el.addEventListener('click',end);document.addEventListener('keydown',function k(){end();document.removeEventListener('keydown',k)});setTimeout(end,dur)}
async function boot(){route();introRun();setTimeout(()=>{const h=location.hash.slice(1);if(['menu','book','contacts','deliv','rating'].includes(h)){const el=document.getElementById(h==='menu'?'mnav':h);if(el)scrollToEl(el,h==='menu')}},400);setTimeout(()=>{const s=$('#splash');if(s)s.remove()},2400);
  if(!LIVE&&ENTRY==='guest')console.warn('[AMORA] Firebase не подключён (assets/config.js): заказы и брони сохраняются только в этом браузере и не доходят до ресторана.');
  if(LIVE){try{const m=await import(new URL('assets/backend-firebase.js',document.baseURI).href);BK=await m.start(CFG,API,ENTRY)}catch(e){console.error('[AMORA]',e);toast('Нет связи с базой данных')}}}

/* ================= ACTIONS ================= */
async function placeOrder(){const f=view.form,tbl=view.mode==='table';
  if(!tbl){if(!f.name.trim()||!normPhone(f.phone)){toast(t('fillNP'));return}
    if(view.ctype==='delivery'&&!f.street.trim()){toast(t('fillA'));return}
    if(f.when==='later'&&!f.time){toast(t('later')+' — '+t('time'));return}}
  else if(!S.settings.tables)return;
  if(cartList().some(([,l])=>!avail(l.id))){toast(t('soldOut')+': '+cartList().filter(([,l])=>!avail(l.id)).map(([,l])=>nm(DMAP[l.id].n)).join(', '));renderDrawer();return}
  const items=cartList().filter(([,l])=>avail(l.id)).map(([,l])=>({id:l.id,q:l.q,p:lineUnit(l),n:{...DMAP[l.id].n},dep:DMAP[l.id].dep||'kitchen',o:optSel(l).map(c=>({ru:c.ru,hy:c.hy,en:c.en})),oi:{...l.o}}));if(!items.length)return;
  if(LIVE&&!BK){toast('Подключаемся… попробуйте через пару секунд');return}
  const sub=items.reduce((s,i)=>s+i.p*i.q,0),fe=fee();const ph=tbl?f.tphone:f.phone;const d=discFor(ph);const da=d?Math.round(sub*d.pct/100):0;
  const btn=$('[data-a=place]');if(btn)btn.disabled=true;
  let n;try{n=LIVE?await BK.nextSeq():++S.seq}catch(e){console.error(e);toast('Не удалось отправить — проверьте интернет');if(btn)btn.disabled=false;return}
  const sv=tbl?svcOf(sub-da):0;const o={id:'o'+n+'-'+Math.random().toString(36).slice(2,6),n,type:tbl?'table':view.ctype,items,sub,fee:fe,total:sub-da+fe+sv,status:'new',ts:now(),hist:{new:now()},note:f.note.trim()};
  if(d)o.disc={pct:d.pct,amt:da,rank:d.rank,month:d.month};if(sv)o.svc={pct:svcPct(),amt:sv};
  if(LIVE)o.guestUid=BK.uid();
  if(tbl){o.table=view.table;o.tkey=view.tkey||((S.tables||{})[view.table])||'';const np=normPhone(f.tphone);if(np){o.phone=np;o.name=(f.tname||'').trim()||'Гость'}
    if(np||(f.tname||'').trim())L.prof=Object.assign(L.prof||{},{name:(f.tname||'').trim()||L.prof.name||'',phone:np||L.prof.phone||''})}
  else{Object.assign(o,{name:f.name.trim(),phone:normPhone(f.phone),pay:f.pay,change:f.pay==='cash'?f.change.replace(/\D/g,''):'',when:f.when,time:f.when==='later'?f.time:''},view.ctype==='delivery'?{street:f.street.trim(),apt:f.apt.trim(),zone:f.zone}:{});
    L.prof={name:f.name.trim(),phone:normPhone(f.phone),street:f.street.trim(),apt:f.apt.trim(),zone:f.zone}}
  S.orders.push(o);L.cart={};L.my.push(o.id);view.form.note='';saveL();view.trackId=o.id;view.step='done';
  if(LIVE&&BK)BK.watchOrder(o.id);
  notify('order',o.id);commit();
  toast('→ Уведомление ушло в панель ресторана','gold')}
function fakeOrder(){const pool=DISHES.filter(d=>avail(d.id));const pick=()=>pool[Math.floor(Math.random()*pool.length)];
  const type=['delivery','pickup','table'][Math.floor(Math.random()*3)];const lines={};for(let i=0;i<2+Math.floor(Math.random()*3);i++){const d=pick();const o=defOpts(d.id);if(d.opts)d.opts.forEach(g=>o[g.id]=Math.floor(Math.random()*g.ch.length));const k=keyOf(d.id,o);lines[k]=lines[k]||{id:d.id,q:0,o};lines[k].q++}
  const its=Object.values(lines).map(l=>({id:l.id,q:l.q,p:lineUnit(l),n:{...DMAP[l.id].n},dep:DMAP[l.id].dep||'kitchen',o:optSel(l).map(c=>({ru:c.ru,hy:c.hy,en:c.en})),oi:l.o}));
  const sub=its.reduce((s,i)=>s+i.p*i.q,0);const fe=type==='delivery'&&sub<S.settings.freeFrom?500:0;const n=++S.seq;
  const names=['Нарек','Мариам','Тигран','Анна','Гор','Сона'];
  const sv=type==='table'?svcOf(sub):0;const o={id:'o'+n+'-x',n,type,items:its,sub,fee:fe,total:sub+fe+sv,svc:sv?{pct:svcPct(),amt:sv}:undefined,status:'new',ts:now(),hist:{new:now()},note:Math.random()<.4?'Без лука, пожалуйста':''};
  if(type==='table')o.table=1+Math.floor(Math.random()*S.settings.tablesN);else Object.assign(o,{name:names[n%6],phone:'+374 9'+(n%10)+' '+(10+n%89)+' 45 67',pay:Math.random()<.5?'cash':'card',change:'',when:'asap'},type==='delivery'?{street:'ул. Шаумяна '+(n%40+1),apt:'кв. '+(n%60+1),zone:'c'}:{});
  if(Math.random()<.65){const cs=Object.values(S.customers||{});const c=cs[Math.floor(Math.random()*cs.length)];if(c){o.name=c.name;o.phone=c.phone}}
  S.orders.push(o);notify('order',o.id);commit()}

function scrollToEl(tg,exact){if(!tg)return;if(tg.id==='mnav'&&tg.parentElement&&tg.parentElement.classList.contains('menublock'))tg=tg.parentElement;const h=($('.hdr')||{}).offsetHeight||66;const y=tg.getBoundingClientRect().top+scrollY-(exact?h-1:h+8);window.scrollTo({top:Math.max(0,y),behavior:RM.matches?'auto':'smooth'})}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
  if(e.target.closest('[data-stop]')&&a==='open')return;
  switch(a){
    case 'home':e.preventDefault();go('');break;
    case 'lang':L.lang=el.dataset.l;saveL();renderAll();break;
    case 'cart':view.step='cart';openDrawer('cart');break;
    case 'mine':openDrawer('mine');break;
    case 'track':view.trackId=id;openDrawer('track');break;
    case 'again':{const o=S.orders.find(o=>o.id===id);let n=0;o.items.forEach(i=>{if(avail(i.id)){addCart(i.id,i.q,i.oi&&Object.keys(i.oi).length?i.oi:defOpts(i.id));n++}});toast(n?t('addedAgain'):t('soldOut'));view.step='cart';openDrawer('cart');break}
    case 'tomenu':e.preventDefault();document.body.classList.remove('mp-on');scrollToEl($('#mnav'),true);break;
    case 'tobook':{const b=$('#book');if(b){document.body.classList.remove('mp-on');scrollToEl(b)}break}
    case 'hprev':heroGo(heroI-1);break;
    case 'hnext':heroGo(heroI+1);break;
    case 'hgo':heroGo(+el.dataset.i);break;
    case 'dep':view.dep=el.dataset.v;view.cat=null;view.filters.clear();renderAll();scrollToEl($('#mnav'),true);break;
    case 'hpp':{heroUserPaused=!heroUserPaused;const sh=$('#hshow');if(sh)sh.classList.toggle('stopped',heroUserPaused||RM.matches);el.innerHTML=heroUserPaused?IC.play:IC.pause;el.setAttribute('aria-label',heroUserPaused?t('play'):t('pause'));if(heroUserPaused){clearTimeout(heroTm);heroTm=null}else heroRestart();break}
    case 'mp':{const on=document.body.classList.toggle('mp-on');el.setAttribute('aria-expanded',on);break}
    case 'preMenu':document.body.classList.remove('mp-on');scrollToEl($('#mnav'),true);toast(t('preHint'),'gold');break;
    case 'toBookPre':{closeAll();const b=$('#book');if(view.bookDone){view.bookDone=null;renderAll()}setTimeout(()=>scrollToEl($('#book')),50);break}
    case 'privacy':e.preventDefault();openModal({kind:'privacy'});break;
    case 'bkagain':view.bookDone=null;renderAll();setTimeout(()=>{const f=$('#bk-n');if(f)f.focus()},50);break;
    case 'cat':view.cat=el.dataset.c||null;$('#dishes').innerHTML=dishesHTML();document.querySelectorAll('#cats button').forEach(b=>b.classList.toggle('on',b.dataset.c===(view.cat||'')));spy();{const mb=$('.menublock');if(mb&&mb.getBoundingClientRect().top<0)scrollToEl(mb,true)}break;
    case 'filt':{const f=el.dataset.f;view.filters.has(f)?view.filters.delete(f):view.filters.add(f);el.classList.toggle('on');$('#dishes').innerHTML=dishesHTML();spy();break}
    case 'inc':e.stopPropagation();addCart(id,1);if(!e.target.closest('.drawer'))toast(t('added')+': '+nm(DMAP[id].n));break;
    case 'dec':e.stopPropagation();{const k=keyOf(id,defOpts(id));bumpKey(k,-1);break}
    case 'incK':bumpKey(el.dataset.k,1);break;
    case 'decK':bumpKey(el.dataset.k,-1);break;
    case 'open':if(!id)break;openSheet(id);break;
    case 'sopt':view.sheetOpts[el.dataset.g]=+el.dataset.i;renderSheet();break;
    case 'sq':view.sheetQty=Math.max(1,view.sheetQty+(+el.dataset.v));renderSheet();break;
    case 'sheetAdd':{const sid=view.sheet;addCart(sid,view.sheetQty,{...view.sheetOpts});toast(t('added')+': '+nm(DMAP[sid].n));$('#sheet').classList.remove('on');view.sheet=null;if(view.drawer)renderDrawer();else $('#ov').classList.remove('on');break}
    case 'closeAll':closeAll();break;
    case 'step':view.step=el.dataset.s;renderDrawer();break;
    case 'ctype':view.ctype=el.dataset.v;renderDrawer();break;
    case 'when':view.form.when=el.dataset.v;renderDrawer();break;
    case 'pay':view.form.pay=el.dataset.v;renderDrawer();break;
    case 'place':placeOrder();break;
    case 'star':view.rate[id]=+el.dataset.v;renderDrawer();break;
    case 'sendRate':{const o=S.orders.find(o=>o.id===id);o.rating=view.rate[id];o.review=(view.rateTxt[id]||'').trim();commit();toast(t('rateThanks'),'gold');break}
    case 'call':{if(!S.settings.tables)return;if(S.calls.some(c=>c.table===view.table&&c.kind==='waiter'&&!c.done))return;const cl={id:'c'+now()+Math.random().toString(36).slice(2,5),table:view.table,tkey:view.tkey||((S.tables||{})[view.table])||'',kind:'waiter',ts:now(),done:false};S.calls.push(cl);notify('call',cl.id);commit();toast('→ '+t('called'),'gold');break}
    case 'bill':if(S.calls.some(c=>c.table===view.table&&c.kind==='bill'&&!c.done))return;openDrawer('bill');break;
    case 'billpay':{const bp=normPhone(($('#bphone')||{}).value),bn=(($('#bname')||{}).value||'').trim();if(bp)L.prof=Object.assign(L.prof||{},{phone:bp,name:bn||L.prof.name||''}),saveL();const cl={id:'c'+now()+Math.random().toString(36).slice(2,5),table:view.table,tkey:view.tkey||((S.tables||{})[view.table])||'',kind:'bill',pay:el.dataset.v,phone:bp||'',name:bn,ts:now(),done:false,orders:S.orders.filter(o=>o.type==='table'&&o.table===view.table&&L.my.includes(o.id)&&!o.closed).map(o=>o.id)};S.calls.push(cl);notify('call',cl.id);closeAll();commit();toast('→ '+t('billAsked'),'gold');break}
    case 'dm':go(el.dataset.v);break;
    case 'pickTable':openModal({kind:'pick'});break;
    case 'seat':{const n=+el.dataset.n;closeAll();go('table-'+n+'-'+((S.tables||{})[n]||''));toast('Стол '+n+' · QR отсканирован','gold');break}
    case 'tour':tourStep(0);renderDemo();break;
    case 'tourGo':tourStep(Math.max(0,Math.min(TOUR.length-1,view.tour+(+el.dataset.v))));break;
    case 'tourX':view.tour=null;renderTour();renderDemo();break;
    case 'tourMin':view.tourMin=true;renderTour();break;
    case 'tourMax':view.tourMin=false;renderTour();break;
    /* staff */
    case 'pin':{const k=el.dataset.k;if(k==='⌫')pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;if(pin.length===4){const u=S.staff.find(x=>x.pin===pin);pin='';if(u){loginStaff(u);break}toast('Неверный PIN')}renderStaff();break}
    case 'logout':staffAuthed=false;staffUser=null;alertInit=false;alerted.clear();view.side=false;if(LIVE&&BK)BK.logout();renderStaff();break;
    case 'stab':if(!canTab(el.dataset.t))break;view.staffTab=el.dataset.t;view.rej=null;view.side=false;view.hlim=100;renderStaff();window.scrollTo(0,0);break;
    case 'fake':fakeOrder();break;
    case 'adv':{const o=findOrder(id);if(!o)break;const nx=nextOf(o);if(!canAdv(o,nx)){toast('Недостаточно прав');break}
      if(nx==='done'&&o.type!=='table'&&!o.paid){openModal({kind:'pay',id,finish:true});break}
      setStatus(o,nx);view.flash.delete(o.id);commit();if(nx==='done'&&o.awarded)toast('🏆 +'+o.awarded+' баллов гостю '+(o.name||''));if(view.smodal&&view.smodal.kind==='order')renderModal();break}
    case 'od':{const o=findOrder(id);if(!o)break;view.flash.delete(id);openModal({kind:'order',id});break}
    case 'ofilt':view.ofilt=el.dataset.v;renderStaff();break;
    case 'odep':view.odep=el.dataset.v;renderStaff();break;
    case 'depReady':{const o=findOrder(id);const d=el.dataset.d;if(!o||!staffUser)break;const r=staffUser.role;if(!(['admin','manager','waiter'].includes(r)||r===d)){toast('Недостаточно прав');break}
      o.dept=o.dept||{};if(o.dept[d])break;o.dept[d]=now();o.trail=o.trail||[];o.trail.push({s:'ready_'+d,ts:now(),by:staffName()});
      if(['accepted','cooking'].includes(o.status)&&depsOf(o).every(x=>o.dept[x])){setStatus(o,'ready')}
      commit();toast('№'+o.n+': '+DEPS[d].ru+' — готово'+(o.status==='ready'?' · заказ готов':''));if(view.smodal&&view.smodal.kind==='order')renderModal();break}
    case 'cancelask':if(!can('cancel'))break;view.cancelK=null;openModal({kind:'cancel',id});break;
    case 'cancelK':view.cancelK=el.dataset.k;renderModal();break;
    case 'cancelGo':{const o=findOrder(id);if(!o||!can('cancel')||!view.cancelK)break;const r=REASONS.find(x=>x.k===view.cancelK);setStatus(o,'cancel',{reasonK:view.cancelK});logA('Отмена заказа','№'+o.n+' · '+(r?r.ru:'')+' · '+fmt(o.total));commit();closeAll();toast('Заказ №'+o.n+' отменён');break}
    case 'payask':if(!can('pay'))break;openModal({kind:'pay',id,finish:false});break;
    case 'payGo':{const o=findOrder(id);if(!o||!can('pay'))break;Object.assign(o,{paid:true,payM:el.dataset.m,paidAt:now(),paidBy:staffName()});logA('Оплата','№'+o.n+' · '+(el.dataset.m==='card'?'карта':'наличные')+' · '+fmt(o.total));if(el.dataset.f==='1'&&o.status!=='done')setStatus(o,'done');commit();closeAll();toast('Заказ №'+o.n+': оплата отмечена'+(o.awarded?' · 🏆 +'+o.awarded:''));break}
    case 'finUnpaid':{const o=findOrder(id);if(!o||!can('unpaid'))break;setStatus(o,'done');logA('Завершён без оплаты','№'+o.n+' · '+fmt(o.total));commit();closeAll();toast('Заказ №'+o.n+' завершён без оплаты');break}
    case 'sound':L.sound=L.sound===false;saveL();if(L.sound)ding();renderStaff();break;
    case 'notifPerm':try{Notification.requestPermission().then(()=>renderStaff())}catch(_){}break;
    case 'side':view.side=!view.side;renderStaff();break;
    case 'srange':view.srange=el.dataset.v;renderStaff();break;
    case 'hmore':view.hlim=(view.hlim||100)+100;renderStaff();break;
    case 'csv':{if(!can('export'))break;const blob=new Blob([toCSV(histFiltered())],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='amora-orders-'+isoD(now())+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);logA('Экспорт заказов','CSV');commit(true);break}
    case 'printRcpt':window.print();break;
    case 'printQR':{const n=S.settings.tablesN;const imgs=[];for(let i=1;i<=n;i++){const q=document.getElementById('qr'+i);const c=q&&q.querySelector('canvas');const im=q&&q.querySelector('img');imgs.push(c?c.toDataURL('image/png'):im&&im.src?im.src:'')}
      if(imgs.some(x=>!x)){toast('QR ещё рисуются — нажмите через секунду');break}
      const base=new URL('.',location.href).href;const w=window.open('','_blank');if(!w){toast('Разрешите всплывающие окна для печати');break}
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AMORA — QR столов</title><style>@page{size:A4;margin:10mm}body{margin:0;font-family:Georgia,serif;background:#fff}.g{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.c{border:1px solid #c9a45f;border-radius:6mm;padding:7mm 6mm;text-align:center;break-inside:avoid;height:118mm;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:#0e0d0b;color:#ebcf93;-webkit-print-color-adjust:exact;print-color-adjust:exact}.c img.l{height:24mm}.q{background:#fff;padding:3mm;border-radius:3mm}.q img{width:44mm;height:44mm;display:block}.t{font-size:9pt;letter-spacing:.25em;text-transform:uppercase}.n{font-size:30pt;line-height:1}.s{font-size:9pt;line-height:1.45;color:#e8dcc5;font-family:Arial,sans-serif}</style></head><body><div class="g">${imgs.map((src,i)=>`<div class="c"><img class="l" src="${base}assets/brand/logo.webp" alt="AMORA"><div class="q"><img src="${src}"></div><div><div class="t">Սեղան · Стол · Table</div><div class="n">${i+1}</div></div><div class="s">Սկանավորեք՝ ճաշացանկ, պատվեր, հաշիվ<br>Сканируйте — меню, заказ, счёт<br>Scan for menu, order &amp; bill</div></div>`).join('')}</div><script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>`);w.document.close();break}
    case 'restoreDish':if(!canMenu())break;S.menu[id]=S.menu[id]||{};delete S.menu[id].deleted;logA('Блюдо восстановлено',(DMAP[id]||{n:{ru:id}}).n.ru);commit();break;
    case 'courier':{const o=findOrder(id);if(!o||!canAdv(o,'onway'))break;o.courier=el.dataset.c;setStatus(o,'onway');commit();toast('№'+o.n+' передан курьеру: '+o.courier);if(view.smodal)renderModal();break}
    case 'rej':view.rej=id;renderStaff();break;
    case 'rejNo':view.rej=null;renderStaff();break;
    case 'rejWhy':{const o=S.orders.find(o=>o.id===id);setStatus(o,'cancel',{reasonK:el.dataset.k});logA('Отмена заказа','№'+o.n);view.rej=null;notify('status',o.id);commit();toast('Заказ отклонён — гость видит причину');break}
    case 'rcpt':openModal({kind:'rcpt',id});break;
    case 'ack':{const c=S.calls.find(c=>c.id===id);c.done=true;commit();break}
    case 'closeTable':{const c=S.calls.find(c=>c.id===id);const own=c.kind==='bill'&&Array.isArray(c.orders)&&c.orders.length;if(own)c.done=true;else S.calls.filter(x=>x.table===c.table).forEach(x=>x.done=true);const bc=own?(c.phone?c:null):S.calls.filter(x=>x.table===c.table&&x.kind==='bill'&&x.phone).pop();let pts=0;S.orders.filter(o=>o.type==='table'&&o.table===c.table&&!o.closed&&(!own||c.orders.includes(o.id))).forEach(o=>{o.closed=true;if(!o.phone&&bc){o.phone=bc.phone;o.name=bc.name||'Гость'}if(o.status!=='cancel'){if(o.status!=='done')setStatus(o,'done');Object.assign(o,{paid:true,payM:c.pay==='card'?'card':'cash',paidAt:now(),paidBy:staffName()});pts+=o.awarded||0}});logA('Стол закрыт и оплачен','Стол '+c.table);commit();toast('Стол '+c.table+' закрыт'+(pts?' · 🏆 +'+pts+' баллов':''));break}
    case 'avail':{if(!canAvail(DMAP[id]))break;S.menu[id]=S.menu[id]||{};S.menu[id].avail=!(S.menu[id].avail!==false);S.menu[id].dep=DMAP[id].dep;logA(S.menu[id].avail?'Снято со стоп-листа':'В стоп-лист',DEPS[DMAP[id].dep].ru+' · '+DMAP[id].n.ru);commit();toast(DMAP[id].n.ru+(DMAP[id].avail?' — снова в наличии':' — в стоп-листе'));break}
    case 'edit':if(!canMenu())break;startEdit(id);break;
    case 'newDish':if(!canMenu())break;startEdit(null);break;
    case 'edNoImg':syncEdit();view.edit.img=null;renderModal();break;
    case 'edDel':{if(!canMenu())break;if(!view.delSure){view.delSure=true;el.textContent='Точно удалить? Нажмите ещё раз';break}view.delSure=false;const did=view.smodal.id;const nmR=(DMAP[did]||{n:{ru:did}}).n.ru;if(did.startsWith('x')){S.added=(S.added||[]).filter(a=>a.id!==did);delete S.menu[did]}else{S.menu[did]=Object.assign(S.menu[did]||{},{deleted:true})}logA('Блюдо удалено',nmR);closeAll();commit();toast('Блюдо удалено из меню');break}
    case 'setb':{const k=el.dataset.k;const ops=['delivery','pickup','tables'].includes(k);if(!(isAdmin()||(ops&&can('ops'))))break;S.settings[k]=!S.settings[k];logA('Настройка',k+' → '+(S.settings[k]?'вкл':'выкл'));commit();break}
    case 'promoOn':S.settings.promo.on=!S.settings.promo.on;commit();break;
    case 'extra':if(!(isAdmin()||can('ops')))break;S.settings.extra=+el.dataset.v;logA('Загрузка кухни','+'+el.dataset.v+' мин');commit();break;
    case 'testding':ding();break;
    case 'opentable':{const u='table-'+el.dataset.n+'-'+((S.tables||{})[el.dataset.n]||'');if(ENTRY==='admin')window.open('index.html#'+u,'_blank');else go(u);break}
    case 'newKey':{if(!isAdmin())break;logA('Новый ключ QR','Стол '+el.dataset.n);S.tables=S.tables||{};S.tables[el.dataset.n]=Math.random().toString(36).slice(2,8);commit();toast('Стол '+el.dataset.n+': новый QR — распечатайте табличку');break}
    case 'goto':{document.body.classList.remove('mp-on');const tg=document.getElementById(el.dataset.v);if(tg)scrollToEl(tg,el.dataset.v==='mnav');break}
    case 'tgFollow':{const o=S.orders.find(o=>o.id===id);if(!o)break;if(LIVE){if(CFG.telegramBot)window.open('https://t.me/'+CFG.telegramBot+'?start=o_'+o.id,'_blank');else toast('Telegram-бот ещё не подключён');break}
      if(!o.tgGuest){o.tgGuest=true;tgMsg('guest','/start',null,true);tgMsg('guest',`Здравствуйте! Я бот AMORA 🍷\nБуду присылать статус заказа №${o.n}.\nСейчас: <b>${stLabelRu(o)}</b>`);commit();toast(t('tgOn')+' · демо: вкладка Telegram в панели','gold')}break}
    case 'tgVerify':{if(LIVE){if(CFG.telegramBot)window.open('https://t.me/'+CFG.telegramBot+'?start=r','_blank');else toast('Telegram-бот ещё не подключён');break}
      const ph=(($('#lookf')||{}).phone||{}).value;const li=custInfo(ph);tgMsg('guest','/start rating',null,true);tgMsg('guest','Чтобы показать ваше место в рейтинге, поделитесь номером кнопкой ниже 👇',['📱 Отправить мой номер']);tgMsg('guest','📱 Контакт: '+(normPhone(ph)||'+374 …'),null,true);
      tgMsg('guest',li.c?`${esc(li.c.name)}, вы <b>#${li.curPos||'—'}</b> в рейтинге за ${monthName(ym(),'ru')} — ${li.curPts} баллов.\nСкидка сейчас: <b>${li.disc?'−'+li.disc+'%':'нет'}</b>`:'Пока нет баллов — сделайте первый заказ с этим номером.');commit(true);toast('Демо: Telegram подтвердит номер — ответ бота во вкладке Telegram панели','gold');break}
    case 'loyOn':S.settings.loyalty.on=!S.settings.loyalty.on;commit();break;
    case 'tierDel':S.settings.loyalty.tiers.splice(+el.dataset.i,1);commit();break;
    case 'tierAdd':{const tr=S.settings.loyalty.tiers;const last=tr[tr.length-1]||{to:0};tr.push({from:last.to+1,to:last.to+10,pct:3});commit();break}
    case 'csv':{const rows=[['Место','Имя','Телефон','Баллы '+ym(),'Заказов','Потрачено']].concat(ranking(ym()).map((c,i)=>[i+1,c.name,c.phone||'',c.score,c.orders||0,c.spent||0]));const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');try{navigator.clipboard.writeText(csv).then(()=>toast('CSV скопирован — вставьте в Excel/Google Таблицы')).catch(()=>toast('Браузер не дал скопировать'))}catch(e){toast('Браузер не дал скопировать')}break}
    case 'delStaff':{if(!isAdmin())break;const x=S.staff.find(x=>x.id===id);if(!view.delStaffSure||view.delStaffSure!==id){view.delStaffSure=id;el.textContent='Подтвердить удаление';break}view.delStaffSure=null;S.staff=S.staff.filter(x=>x.id!==id);logA('Сотрудник удалён',x?x.name+' ('+x.role+')':id);commit();toast('Доступ сотрудника отключён');break}
    case 'bk':{const b=S.bookings.find(b=>b.id===id);b.status=el.dataset.v;b.by=staffName();if(b.orderId){const o=findOrder(b.orderId);if(o&&b.status==='no'&&!['done','cancel'].includes(o.status)){setStatus(o,'cancel',{reasonTxt:'Бронь отклонена'});logA('Отмена предзаказа','№'+o.n+' · бронь отклонена')}if(o&&b.status==='ok'&&o.status==='new')setStatus(o,'accepted')}commit();break}
    case 'reset':if(ENTRY!=='demo')break;S=seed();L.my=[];L.cart={};saveL();commit();toast('Демо сброшено');break;
  }
});
document.addEventListener('change',e=>{const el=e.target,a=el.dataset&&el.dataset.a;if(!a)return;
  if(a==='hfrom'||a==='hto'){view[a]=el.value;view.hlim=100;renderStaff();return}
  if(a==='hst'||a==='hty'){view[a]=el.value;view.hlim=100;renderStaff();return}
  if(a==='price'){if(!canMenu())return;const v=parseInt(el.value.replace(/\D/g,''))||0;if(v>0){const was=price(el.dataset.id);S.menu[el.dataset.id]=S.menu[el.dataset.id]||{};S.menu[el.dataset.id].p=v;logA('Цена изменена',DMAP[el.dataset.id].n.ru+': '+was+' → '+v);commit(true);toast('Цена обновлена на сайте')}}
  if(a==='zone'){if(!isAdmin())return;logA('Настройка','zone');S.settings.zones[+el.dataset.i].fee=parseInt(el.value)||0;commit(true)}
  if(a==='setn'){if(!isAdmin())return;logA('Настройка','setn');S.settings[el.dataset.k]=parseInt(el.value)||0;commit(true)}
  if(a==='sett'){if(!isAdmin())return;logA('Настройка','sett');S.settings[el.dataset.k]=el.value;commit(true)}
  if(a==='promo'){S.settings.promo[el.dataset.l]=el.value;commit(true);toast('Баннер обновлён')}
  if(a==='couriers'){if(!isAdmin())return;logA('Настройка','couriers');S.settings.couriers=el.value.split(',').map(s=>s.trim()).filter(Boolean);commit(true)}
  if(a==='loy'){S.settings.loyalty[el.dataset.k]=Math.max(1,parseInt(el.value)||1);commit(true);toast('Правила обновлены')}
  if(a==='tier'){S.settings.loyalty.tiers[+el.dataset.i][el.dataset.k]=Math.max(0,parseInt(el.value)||0);commit(true);toast('Уровень обновлён')}
  if(a==='tablesN'){if(!isAdmin())return;logA('Настройка','tablesN');S.settings.tablesN=Math.max(1,Math.min(60,parseInt(el.value)||1));commit()}
});
document.addEventListener('submit',e=>{if(e.target.id==='bookf'){e.preventDefault();const b=Object.fromEntries(new FormData(e.target));
  if(!String(b.name||'').trim()||String(b.phone).replace(/\D/g,'').length<8){toast(t('fillNP'));(String(b.name||'').trim()?e.target.phone:e.target.name).focus();return}
  if(!b.date||!b.time||new Date(b.date+'T'+b.time).getTime()<now()-5*60000){toast(t('bkPast'));e.target.time.focus();return}
  L.prof.name=String(b.name).trim();L.prof.phone=b.phone;saveL();
  const bk={id:'b'+now()+Math.random().toString(36).slice(2,5),name:String(b.name).trim(),phone:b.phone,date:b.date,time:b.time,guests:+b.guests,note:String(b.note||'').trim().slice(0,200),status:'new',ts:now()};
  const form=e.target;(async()=>{
    if(b.pre&&cartCount()){
      if(cartList().some(([,l])=>!avail(l.id))){toast(t('soldOut')+': '+cartList().filter(([,l])=>!avail(l.id)).map(([,l])=>nm(DMAP[l.id].n)).join(', '));return}
      if(LIVE&&!BK){toast('Подключаемся… попробуйте через пару секунд');return}
      const btn=form.querySelector('[type=submit]');if(btn)btn.disabled=true;
      let n;try{n=LIVE?await BK.nextSeq():++S.seq}catch(er){toast('Не удалось отправить — проверьте интернет');if(btn)btn.disabled=false;return}
      const items=cartList().map(([,l])=>({id:l.id,q:l.q,p:lineUnit(l),n:{...DMAP[l.id].n},dep:DMAP[l.id].dep||'kitchen',o:optSel(l).map(c=>({ru:c.ru,hy:c.hy,en:c.en})),oi:{...l.o}}));const sub=items.reduce((s,i)=>s+i.p*i.q,0);
      const o={id:'o'+n+'-'+Math.random().toString(36).slice(2,6),n,type:'book',items,sub,fee:0,total:sub+svcOf(sub),svc:svcOf(sub)?{pct:svcPct(),amt:svcOf(sub)}:undefined,status:'new',ts:now(),hist:{new:now()},note:bk.note,name:bk.name,phone:normPhone(bk.phone),when:'later',date:b.date,time:b.time,at:new Date(b.date+'T'+b.time).getTime(),guests:+b.guests,bookingId:bk.id,pay:'onsite'};
      if(LIVE)o.guestUid=BK.uid();
      S.orders.push(o);L.my.push(o.id);L.cart={};saveL();if(LIVE&&BK)BK.watchOrder(o.id);
      Object.assign(bk,{orderId:o.id,orderN:n,preSum:sub});notify('order',o.id)}
    S.bookings.push(bk);notify('booking',bk.id);commit(true);view.bookDone=bk;renderAll();renderDemo();setTimeout(()=>{const k=$('.bkok');if(k)k.scrollIntoView({block:'center',behavior:RM.matches?'auto':'smooth'})},30)})()}
  if(e.target.id==='lookf'){e.preventDefault();const ph=e.target.phone.value;const n=normPhone(ph);(async()=>{if(n&&BK&&BK.fetchCustomer){try{await BK.fetchCustomer(cid(n))}catch(_){}}$('#rres').innerHTML=lookupHTML(ph)})()}
  if(e.target.id==='manf'){e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));const n=normPhone(fd.phone),amt=parseInt(String(fd.amt).replace(/\D/g,''))||0;if(!n||!amt){toast('Укажите телефон и сумму чека');return}const ps={phone:n,name:(fd.name||'').trim(),total:amt,ts:now()};award(ps);commit();toast('🏆 +'+(ps.awarded||0)+' баллов · '+n)}
  if(e.target.id==='stf'){e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));if(!fd.name.trim()){toast('Укажите имя');return}
    if(LIVE){if(!/^[a-z0-9._@-]{2,}$/i.test((fd.cred||'').trim())||String(fd.pw||'').length<6){toast('Логин латиницей и пароль от 6 символов');return}BK.addStaff(fd.cred.trim(),fd.pw,fd.name.trim(),fd.role).then(()=>{logA('Сотрудник добавлен',fd.name.trim()+' ('+fd.role+')');commit(true);toast('Сотрудник добавлен')}).catch(er=>toast('Ошибка: '+(er.code||er.message)))}
    else{if(!/^\d{4}$/.test(fd.cred||'')||S.staff.some(x=>x.pin===fd.cred)){toast('PIN — 4 цифры, не занятый другим');return}S.staff.push({id:'u'+now(),name:fd.name.trim(),role:fd.role,pin:fd.cred});logA('Сотрудник добавлен',fd.name.trim()+' ('+fd.role+')');commit();toast('Сотрудник добавлен')}}
  if(e.target.id==='loginf'){e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));if(!BK){toast('Подключаемся к базе…');return}BK.login(fd.email.trim(),fd.pw).catch(er=>toast(er&&er.message==='not-staff'?'Этот аккаунт не сотрудник AMORA':'Неверный e-mail или пароль'))}
  if(e.target.id==='cof')e.preventDefault()});
$('#ov').onclick=closeAll;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
setInterval(()=>{if(view.mode==='staff'&&staffAuthed&&['orders','calls','kitchen'].includes(view.staffTab)&&!document.activeElement.matches('input,textarea,select')&&!view.smodal&&!view.rej)renderStaff()},20000);
let blink=false;setInterval(()=>{const pend=S.orders.some(o=>o.status==='new')||S.calls.some(c=>!c.done);
  if(view.mode==='staff'&&staffAuthed&&pend&&staffUser&&staffUser.role!=='kitchen'){if(S.settings.repeat)ding();blink=!blink;document.title=blink?'● Новый заказ — AMORA':'AMORA — Панель ресторана'}else if(view.mode!=='staff')document.title=t('seoTitle')},8000);
boot();

