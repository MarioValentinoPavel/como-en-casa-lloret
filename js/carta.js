// Carta completa de Mirian & Salva (transcrita de su carta impresa, octubre 2026)
// p: precio · p2: [chapata, baguete] · img: miniatura en assets/carta · t: etiquetas
// etiquetas: share (para compartir), sea (del mar), hot (picante), af (afrodisíaco), kids
(() => {
  const L = (es, ca, en, fr) => ({ es, ca, en, fr });

  // guarniciones de los combinados
  const SIDES = {
    F: L('patatas fritas', 'patates fregides', 'fries', 'frites'),
    S: L('ensalada', 'amanida', 'salad', 'salade'),
    E1: L('un huevo frito', 'un ou ferrat', 'a fried egg', 'un œuf au plat'),
    E2: L('dos huevos fritos', 'dos ous ferrats', 'two fried eggs', 'deux œufs au plat'),
    P: L('pimiento verde', 'pebrot verd', 'green pepper', 'poivron vert')
  };

  const cats = [
    {
      id: 'casa', img: true,
      t: L('Especialidad de la casa', 'Especialitat de la casa', 'House speciality', 'Spécialité de la maison'),
      n: L('Totalmente caseros.', 'Totalment casolans.', 'Completely homemade.', 'Entièrement faits maison.'),
      items: [
        { n: 'Nachos caseros', p: 17.5, img: 'nachos-real', t: ['share', 'hot', 'af'],
          d: L('Totopos hechos en casa con carne picada, queso fundido y guacamole.', 'Totopos fets a casa amb carn picada, formatge fos i guacamole.', 'House-made tortilla chips with minced meat, melted cheese and guacamole.', 'Chips de tortilla maison, viande hachée, fromage fondu et guacamole.'),
          af: L('Jalapeño y aguacate: picante y cremoso, por ese orden.', 'Jalapeny i alvocat: picant i cremós, per aquest ordre.', 'Jalapeño and avocado: heat first, then creaminess.', 'Jalapeño et avocat : le piquant, puis l’onctueux.') },
        { n: 'Nachos caseros con pulled pork', p: 19.5, img: 'nachos-pulled', t: ['share', 'hot'],
          d: L('Los mismos nachos con cerdo desmigado a fuego lento.', 'Els mateixos nachos amb porc desfilat a foc lent.', 'The same nachos topped with slow-cooked pulled pork.', 'Les mêmes nachos avec du porc effiloché cuit lentement.') }
      ]
    },
    {
      id: 'latina', img: true,
      t: L('Comida latina', 'Menjar llatí', 'Latin food', 'Cuisine latine'),
      n: L('Recetas de Honduras, Bolivia, Perú, Colombia, Cuba y México.', 'Receptes d’Hondures, Bolívia, Perú, Colòmbia, Cuba i Mèxic.', 'Recipes from Honduras, Bolivia, Peru, Colombia, Cuba and Mexico.', 'Recettes du Honduras, de Bolivie, du Pérou, de Colombie, de Cuba et du Mexique.'),
      items: [
        { n: 'Tacos', p: 11, img: 'tacos-real', o: 'HN',
          d: L('Enrollados y crujientes, con repollo, salsa y queso por encima.', 'Enrotllats i cruixents, amb col, salsa i formatge per sobre.', 'Rolled and crispy, topped with cabbage, sauce and cheese.', 'Roulés et croustillants, avec chou, sauce et fromage.') },
        { n: 'Pollo chuco', p: 15, img: 'pollo-chuco', o: 'HN',
          d: L('Pollo frito sobre tajadas de plátano verde, repollo y aderezo.', 'Pollastre fregit sobre rodanxes de plàtan verd, col i amaniment.', 'Fried chicken over green plantain chips, cabbage and dressing.', 'Poulet frit sur chips de banane plantain verte, chou et sauce.') },
        { n: 'Pique macho', p: 14, img: 'pique-macho', o: 'BO', t: ['hot'],
          d: L('Carne, salchicha, papas, tomate, cebolla y huevo. Para valientes.', 'Carn, salsitxa, patates, tomàquet, ceba i ou. Per a valents.', 'Beef, sausage, potatoes, tomato, onion and egg. For the brave.', 'Bœuf, saucisse, pommes de terre, tomate, oignon et œuf. Pour les courageux.') },
        { n: 'Lomo saltado', p: 15, img: 'lomo-saltado', o: 'PE',
          d: L('Ternera salteada con cebolla y tomate, papas fritas y arroz.', 'Vedella saltejada amb ceba i tomàquet, patates fregides i arròs.', 'Beef stir-fried with onion and tomato, fries and rice.', 'Bœuf sauté à l’oignon et à la tomate, frites et riz.') },
        { n: 'Ceviche', p: 19, img: 'ceviche', o: 'PE', t: ['sea', 'af'],
          d: L('Pescado curado en lima con cebolla morada, camote y choclo.', 'Peix curat amb llima, ceba morada, moniato i blat de moro.', 'Fish cured in lime with red onion, sweet potato and corn.', 'Poisson mariné au citron vert, oignon rouge, patate douce et maïs.'),
          af: L('Lima, cebolla morada y pescado crudo: el plato que más despierta.', 'Llima, ceba morada i peix cru: el plat que més desperta.', 'Lime, red onion and raw fish: the most awakening dish on the menu.', 'Citron vert, oignon rouge et poisson cru : le plat qui réveille le plus.') },
        { n: 'Ropa vieja', p: 17, img: 'ropa-vieja', o: 'CU',
          d: L('Carne deshilachada en su salsa, con arroz, plátano y ensalada.', 'Carn esfilagarsada amb la seva salsa, arròs, plàtan i amanida.', 'Shredded beef in its sauce, with rice, plantain and salad.', 'Bœuf effiloché dans sa sauce, riz, plantain et salade.') },
        { n: 'Salteñas', p: 5.2, u: 1, img: 'saltenas', o: 'BO',
          d: L('Empanada horneada y jugosa. Se come con cuidado y con las manos.', 'Empanada al forn i sucosa. Es menja amb compte i amb les mans.', 'A juicy baked empanada. Eat it carefully, with your hands.', 'Empanada au four, bien juteuse. Se mange avec précaution, avec les mains.') },
        { n: 'Burrito', p: 6, img: 'burrito', o: 'MX',
          d: L('Tortilla de trigo bien cerrada y bien llena.', 'Truita de blat ben tancada i ben plena.', 'A flour tortilla, well wrapped and well filled.', 'Tortilla de blé bien fermée et bien garnie.') },
        { n: 'Picada colombiana', p: 28.5, img: 'picada-colombiana', o: 'CO', t: ['share'],
          d: L('Para el centro de la mesa: carnes, chorizo, papa, yuca y plátano.', 'Per al centre de la taula: carns, xoriço, patata, iuca i plàtan.', 'For the middle of the table: meats, chorizo, potato, yuca and plantain.', 'Au centre de la table : viandes, chorizo, pomme de terre, manioc et plantain.') },
        { n: 'Tajadas con carne', p: 16, img: 'tajadas', o: 'HN',
          d: L('Plátano verde frito con carne, repollo y salsa.', 'Plàtan verd fregit amb carn, col i salsa.', 'Fried green plantain with meat, cabbage and sauce.', 'Banane plantain verte frite avec viande, chou et sauce.') },
        { n: 'Tostones', p: 18, img: 'tostones', o: 'CA', t: ['af'],
          d: L('Plátano verde aplastado y frito, cargado de carne y aguacate.', 'Plàtan verd aixafat i fregit, carregat de carn i alvocat.', 'Smashed, fried green plantain loaded with meat and avocado.', 'Plantain vert écrasé et frit, garni de viande et d’avocat.'),
          af: L('Plátano y aguacate, la pareja más tropical de la carta.', 'Plàtan i alvocat, la parella més tropical de la carta.', 'Plantain and avocado, the most tropical couple on the menu.', 'Plantain et avocat, le couple le plus tropical de la carte.') },
        { n: 'Enchiladas', p: 17.75, img: 'enchiladas', o: 'HN',
          d: L('Tortillas crujientes con carne, repollo, salsa y queso.', 'Truites cruixents amb carn, col, salsa i formatge.', 'Crispy tortillas with meat, cabbage, sauce and cheese.', 'Tortillas croustillantes avec viande, chou, sauce et fromage.') }
      ]
    },
    {
      id: 'calientes', img: true,
      t: L('Raciones calientes', 'Racions calentes', 'Hot sharing plates', 'Assiettes chaudes à partager'),
      n: L('Para picar al centro.', 'Per picar al centre.', 'To share in the middle.', 'À partager au centre.'),
      items: [
        { n: 'Patatas fritas', p: 4.5, img: 'patatas-fritas', t: ['share'], g: L('', 'Patates fregides', 'French fries', 'Frites') },
        { n: 'Patatas bravas', p: 8, img: 'bravas-real', t: ['share', 'hot'],
          d: L('Con salsa brava picante.', 'Amb salsa brava picant.', 'Fried potatoes with spicy brava sauce.', 'Pommes de terre, sauce brava pimentée.') },
        { n: 'Croquetas de pollo', p: 9.5, img: 'croquetas-pollo', t: ['share'],
          d: L('8 unidades.', '8 unitats.', 'Chicken croquettes, 8 pieces.', 'Croquettes de poulet, 8 pièces.') },
        { n: 'Calamares a la romana', p: 13, img: 'calamares-romana', t: ['share', 'sea'],
          d: L('Anillas rebozadas.', 'Anelles arrebossades.', 'Battered squid rings.', 'Beignets de calamar.') },
        { n: 'Calamares a la andaluza', p: 13, img: 'calamares-andaluza', t: ['share', 'sea'],
          d: L('Enharinados y fritos, al estilo andaluz.', 'Enfarinats i fregits, a l’andalusa.', 'Flour-dusted fried squid, Andalusian style.', 'Calamars frits à l’andalouse.') },
        { n: 'Croquetas de rabo de toro', p: 16, img: 'croquetas-rabo', t: ['share'],
          d: L('8 unidades.', 'Cua de bou, 8 unitats.', 'Oxtail croquettes, 8 pieces.', 'Croquettes de queue de taureau, 8 pièces.') },
        { n: 'Callos', p: 10, img: 'callos', t: ['share'],
          d: L('Guiso tradicional.', 'Guisat tradicional.', 'Traditional Spanish tripe stew.', 'Tripes mijotées à l’espagnole.') },
        { n: 'Alitas de pollo', p: 10, img: 'alitas', t: ['share'],
          d: L('8 unidades.', 'Aletes de pollastre, 8 unitats.', 'Chicken wings, 8 pieces.', 'Ailes de poulet, 8 pièces.') },
        { n: 'Morro frito', p: 10, img: 'morro', t: ['share'],
          d: L('Morro de cerdo frito y crujiente.', 'Morro de porc fregit i cruixent.', 'Crispy fried pork snout.', 'Museau de porc frit et croustillant.') },
        { n: 'Gambas al ajillo', p: 14, img: 'gambas', t: ['share', 'sea', 'hot', 'af'],
          d: L('En cazuela de barro, con ajo y guindilla.', 'En cassola de fang, amb all i bitxo.', 'Sizzling garlic prawns in a clay dish.', 'Crevettes à l’ail et au piment, en cassolette.'),
          af: L('Ajo, guindilla y marisco: un clásico con fama.', 'All, bitxo i marisc: un clàssic amb fama.', 'Garlic, chilli and seafood: a classic with a reputation.', 'Ail, piment et fruits de mer : un classique qui a sa réputation.') },
        { n: 'Torreznos', p: 12, img: 'torreznos', t: ['share'],
          d: L('Panceta frita, crujiente por fuera.', 'Cansalada fregida, cruixent per fora.', 'Crispy fried pork belly bites.', 'Poitrine de porc frite et croustillante.') },
        { n: 'Pulpo a la gallega', p: 20, img: 'pulpo', t: ['share', 'sea', 'af'],
          d: L('Con pimentón y aceite de oliva.', 'Amb pebre vermell i oli d’oliva.', 'Galician-style octopus with paprika and olive oil.', 'Poulpe à la galicienne, paprika et huile d’olive.'),
          af: L('El marisco siempre ha tenido fama. El pulpo, más.', 'El marisc sempre ha tingut fama. El pop, més.', 'Seafood has always had a reputation. Octopus most of all.', 'Les fruits de mer ont toujours eu leur réputation. Le poulpe encore plus.') },
        { n: 'Pinchos morunos de pollo', p: 11, img: 'pinchos-pollo', t: ['share'],
          d: L('Brochetas especiadas.', 'Broquetes especiades de pollastre.', 'Spiced chicken skewers.', 'Brochettes de poulet épicées.') },
        { n: 'Pinchos morunos de cerdo', p: 11, img: 'pinchos-cerdo', t: ['share'],
          d: L('Brochetas especiadas.', 'Broquetes especiades de porc.', 'Spiced pork skewers.', 'Brochettes de porc épicées.') }
      ]
    },
    {
      id: 'frias', img: true,
      t: L('Raciones frías y ensaladas', 'Racions fredes i amanides', 'Cold plates and salads', 'Assiettes froides et salades'),
      n: L('Con pan con tomate.', 'Amb pa amb tomàquet.', 'Served with tomato bread.', 'Servies avec du pain à la tomate.'),
      items: [
        { n: 'Surtido de embutidos', p: 20, img: 'embutidos', t: ['share'],
          d: L('Embutidos variados con pan con tomate.', 'Embotits variats amb pa amb tomàquet.', 'Assorted cured meats with tomato bread.', 'Assortiment de charcuterie, pain à la tomate.') },
        { n: 'Jamón serrano', p: 18, img: 'jamon', t: ['share'],
          d: L('Con pan con tomate.', 'Pernil serrà amb pa amb tomàquet.', 'Serrano ham with tomato bread.', 'Jambon serrano, pain à la tomate.') },
        { n: 'Queso manchego', p: 15, img: 'queso', t: ['share'],
          d: L('Con pan con tomate.', 'Formatge manxec amb pa amb tomàquet.', 'Manchego cheese with tomato bread.', 'Fromage manchego, pain à la tomate.') },
        { n: 'Ensalada mixta', p: 9.5, img: 'ensalada-mixta',
          d: L('Lechuga, tomate, cebolla, atún y huevo duro.', 'Enciam, tomàquet, ceba, tonyina i ou dur.', 'Lettuce, tomato, onion, tuna and hard-boiled egg.', 'Laitue, tomate, oignon, thon et œuf dur.') },
        { n: 'Ensalada César', p: 10, img: 'ensalada-cesar',
          d: L('Lechuga, pollo y salsa césar.', 'Enciam, pollastre i salsa cèsar.', 'Lettuce, chicken and Caesar dressing.', 'Laitue, poulet et sauce César.') }
      ]
    },
    {
      id: 'combinados', img: true,
      t: L('Platos combinados', 'Plats combinats', 'Combo plates', 'Assiettes composées'),
      n: L('Un plato completo, como en casa.', 'Un plat complet, com a casa.', 'A full plate, like at home.', 'Une assiette complète, comme à la maison.'),
      items: [
        { n: 'Sepia', p: 17, img: 'sepia', s: ['F', 'S'], t: ['sea'], g: L('', 'Sípia', 'Cuttlefish', 'Seiche') },
        { n: 'Bistec', p: 17, img: 'bistec', s: ['F', 'E1'], g: L('', 'Bistec', 'Beef steak', 'Bifteck') },
        { n: 'Lomo', p: 12.5, img: 'lomo', s: ['F', 'S', 'E1'], g: L('', 'Llom', 'Pork loin', 'Filet de porc') },
        { n: 'Butifarra', p: 13.5, img: 'butifarra', s: ['F', 'E1'], g: L('', 'Botifarra', 'Catalan sausage', 'Saucisse catalane') },
        { n: 'Entrecot', p: 21, img: 'entrecot', s: ['F'], g: L('', 'Entrecot', 'Entrecôte steak', 'Entrecôte') },
        { n: 'Escalopa de ternera', p: 18, img: 'escalopa', s: ['F', 'S'], g: L('', 'Escalopa de vedella', 'Breaded veal escalope', 'Escalope de veau panée') },
        { n: 'Lenguado', p: 18, img: 'lenguado', s: ['F', 'S'], t: ['sea'], g: L('', 'Llenguado', 'Sole', 'Sole') },
        { n: 'Pechuga de pollo', p: 15, img: 'pechuga', s: ['F', 'S'], g: L('', 'Pit de pollastre', 'Chicken breast', 'Blanc de poulet') },
        { n: 'Bacon', p: 11.75, img: 'bacon', s: ['F', 'E2'], g: L('', 'Bacó', 'Bacon', 'Bacon') },
        { n: 'Chorizo o morcilla', p: 14.5, img: 'chorizo', s: ['F', 'E2', 'P'], g: L('', 'Xoriço o botifarra negra', 'Chorizo or black pudding', 'Chorizo ou boudin noir') }
      ]
    },
    {
      id: 'paella', img: true,
      t: L('Paella y fideuá', 'Paella i fideuà', 'Paella and fideuá', 'Paella et fideuá'),
      n: L('Precio por persona.', 'Preu per persona.', 'Price per person.', 'Prix par personne.'),
      items: [
        { n: 'Paella', p: 14.9, pp: 1, img: 'paella', t: ['share', 'af'],
          d: L('La de siempre, al centro de la mesa.', 'La de sempre, al mig de la taula.', 'Spain’s classic rice dish, served in the pan for the table.', 'Le grand classique, servi dans la poêle au centre de la table.'),
          af: L('Compartir sartén ya es una declaración de intenciones.', 'Compartir paella ja és una declaració d’intencions.', 'Sharing one pan is already a statement of intent.', 'Partager la même poêle, c’est déjà une déclaration.') },
        { n: 'Fideuá', p: 14.9, pp: 1, img: 'fideua', t: ['share', 'sea'],
          d: L('Como la paella, pero con fideos.', 'Com la paella, però amb fideus.', 'Like paella, but made with short noodles.', 'Comme une paella, mais avec des vermicelles.') }
      ]
    },
    {
      id: 'bocadillos', bread: true,
      t: L('Bocadillos', 'Entrepans', 'Sandwiches', 'Sandwichs'),
      n: L('Planchados, en chapata o en baguete.', 'Planxats, en xapata o en baguet.', 'Pressed and toasted, in ciabatta or baguette.', 'Grillés, en ciabatta ou en baguette.'),
      groups: [
        { t: L('Fríos', 'Freds', 'Cold', 'Froids'), items: [
          { n: 'Jamón serrano', p2: [7.5, 6], g: L('', 'Pernil serrà', 'Serrano ham', 'Jambon serrano') },
          { n: 'Jamón dulce', p2: [6, 5], g: L('', 'Pernil dolç', 'Cooked ham', 'Jambon blanc') },
          { n: 'Queso manchego', p2: [7.5, 6], g: L('', 'Formatge manxec', 'Manchego cheese', 'Fromage manchego') },
          { n: 'Fuet', p2: [6, 5], g: L('', 'Fuet', 'Catalan dry sausage', 'Saucisson sec catalan') },
          { n: 'Vegetal', p2: [8.5, 7], d: L('Atún, lechuga, queso, tomate y huevo duro.', 'Tonyina, enciam, formatge, tomàquet i ou dur.', 'Tuna, lettuce, cheese, tomato and hard-boiled egg.', 'Thon, laitue, fromage, tomate et œuf dur.') }
        ] },
        { t: L('Calientes', 'Calents', 'Hot', 'Chauds'), items: [
          { n: 'Serranito', p2: [9, 7], d: L('Lomo, pimiento verde y jamón.', 'Llom, pebrot verd i pernil.', 'Pork loin, green pepper and ham.', 'Filet de porc, poivron vert et jambon.') },
          { n: 'Pepito', p2: [9, 7], d: L('Bistec de ternera y pimiento verde.', 'Bistec de vedella i pebrot verd.', 'Beef steak and green pepper.', 'Bifteck de bœuf et poivron vert.') },
          { n: 'Pechuga de pollo', p2: [8.5, 6.75], g: L('', 'Pit de pollastre', 'Chicken breast', 'Blanc de poulet') },
          { n: 'Tortilla francesa', p2: [7, 6], g: L('', 'Truita francesa', 'Plain omelette', 'Omelette nature') },
          { n: 'Tortilla de patata', p2: [8, 6.75], g: L('', 'Truita de patates', 'Spanish potato omelette', 'Tortilla de pommes de terre') },
          { n: 'Frankfurt', p2: [7, 6], g: L('', 'Frankfurt', 'Frankfurter', 'Saucisse de Francfort') },
          { n: 'Salchichas', p2: [7.5, 6.5], g: L('', 'Salsitxes', 'Sausages', 'Saucisses') },
          { n: 'Butifarra', p2: [8.5, 7], g: L('', 'Botifarra', 'Catalan sausage', 'Saucisse catalane') },
          { n: 'Bacon', p2: [8, 6], g: L('', 'Bacó', 'Bacon', 'Bacon') },
          { n: 'Lomo', p2: [8, 6], g: L('', 'Llom', 'Pork loin', 'Filet de porc') },
          { n: 'Chistorra', p2: [7, 6], g: L('', 'Xistorra', 'Chistorra, a thin paprika sausage', 'Chistorra, fine saucisse au paprika') },
          { n: 'Calamares', p2: [8.5, 7], t: ['sea'], g: L('', 'Calamars', 'Fried squid', 'Calamars frits') },
          { n: 'Bikini', p: 4.5, d: L('Sándwich caliente de jamón y queso.', 'Biquini de pernil i formatge.', 'Toasted ham and cheese sandwich.', 'Croque jambon-fromage.') }
        ] }
      ],
      extras: { t: L('Suplementos', 'Suplements', 'Extras', 'Suppléments'), items: [
        [L('Queso', 'Formatge', 'Cheese', 'Fromage'), 0.7],
        [L('Cebolla', 'Ceba', 'Onion', 'Oignon'), 0.75],
        [L('Pimiento frito', 'Pebrot fregit', 'Fried pepper', 'Poivron frit'), 0.7],
        [L('Huevo frito', 'Ou ferrat', 'Fried egg', 'Œuf au plat'), 1.5],
        [L('All i oli', 'All i oli', 'Garlic aioli', 'Aïoli'), 2]
      ] }
    },
    {
      id: 'burgers', img: true,
      t: L('Burgers', 'Hamburgueses', 'Burgers', 'Burgers'),
      n: L('', '', '', ''),
      items: [
        { n: 'Burger de la casa', p: 7,
          d: L('Con cebolla y queso.', 'Amb ceba i formatge.', 'With onion and cheese.', 'Oignon et fromage.') },
        { n: 'Burger completa', p: 8.5, img: 'burger-real',
          d: L('Tomate, lechuga, queso, huevo frito y cebolla caramelizada.', 'Tomàquet, enciam, formatge, ou ferrat i ceba caramel·litzada.', 'Tomato, lettuce, cheese, fried egg and caramelised onion.', 'Tomate, laitue, fromage, œuf au plat et oignon caramélisé.') },
        { n: 'Burger pulled pork', p: 9,
          d: L('Lechuga, cebolla, queso y salsa barbacoa.', 'Enciam, ceba, formatge i salsa barbacoa.', 'Lettuce, onion, cheese and barbecue sauce.', 'Laitue, oignon, fromage et sauce barbecue.') }
      ]
    },
    {
      id: 'infantil', img: true,
      t: L('Menú infantil', 'Menú infantil', 'Kids’ menu', 'Menu enfant'),
      n: L('', '', '', ''),
      items: [
        { n: 'Canelones de carne', p: 9, img: 'canelones', t: ['kids'], g: L('', 'Canelons de carn', 'Meat cannelloni', 'Cannellonis à la viande') },
        { n: 'Macarrones boloñesa', p: 9, img: 'macarrones', t: ['kids'], g: L('', 'Macarrons a la bolonyesa', 'Macaroni bolognese', 'Macaronis bolognaise') },
        { n: 'Pechuga empanada', p: 12, img: 'pechuga-empanada', t: ['kids'], k: 1, g: L('', 'Pit arrebossat', 'Breaded chicken breast', 'Blanc de poulet pané') },
        { n: 'Fingers o nuggets', p: 10, img: 'nuggets', t: ['kids'], k: 1, g: L('', 'Fingers o nuggets', 'Chicken fingers or nuggets', 'Fingers ou nuggets de poulet') },
        { n: 'Frankfurt o salchichas', p: 11, img: 'frankfurt', t: ['kids'], k: 1, g: L('', 'Frankfurt o salsitxes', 'Frankfurter or sausages', 'Saucisse de Francfort ou saucisses') }
      ]
    },
    {
      id: 'postres', img: true,
      t: L('Postres', 'Postres', 'Desserts', 'Desserts'),
      n: L('', '', '', ''),
      items: [
        { n: 'Helado almendrado', p: 4, img: 'helado', g: L('', 'Gelat ametllat', 'Almond-coated ice cream bar', 'Glace enrobée aux amandes') },
        { n: 'Flan de huevo', p: 4.25, img: 'flan', g: L('', 'Flam d’ou', 'Egg custard flan', 'Flan aux œufs') },
        { n: 'Sorbete de mandarina con nata', p: 5.5, img: 'sorbete', g: L('', 'Sorbet de mandarina amb nata', 'Mandarin sorbet with whipped cream', 'Sorbet mandarine et chantilly') },
        { n: 'Catalanet', p: 5.5, img: 'catalanet',
          d: L('Helado de turrón, nata y ratafía.', 'Gelat de torró, nata i ratafia.', 'Turrón ice cream, cream and ratafia liqueur.', 'Glace au touron, chantilly et ratafia.') },
        { n: 'Tartas variadas', p: 5.5, img: 'tartas', t: ['af'],
          d: L('Queso, Santiago, chocolate o crema catalana.', 'Formatge, Santiago, xocolata o crema catalana.', 'Cheesecake, Santiago almond cake, chocolate or crema catalana.', 'Cheesecake, gâteau de Santiago, chocolat ou crème catalane.'),
          af: L('Pide la de chocolate. El cacao también tiene su fama.', 'Demana la de xocolata. El cacau també té la seva fama.', 'Order the chocolate one. Cocoa has its reputation too.', 'Prenez celle au chocolat. Le cacao aussi a sa réputation.') }
      ]
    }
  ];

  // ---------- la barra ----------
  // vaso: alto, bajo, huracan, copa, margarita, coco, coupe
  const copas = [
    { n: 'Mojito', p: 9, v: 'alto', c: ['#e9f4c8', '#bfe08a'], ice: 1, mint: 1, gar: ['lima'], straw: '#f4ead9' },
    { n: 'Mojito de fresa', p: 9.5, v: 'alto', c: ['#ff8aa0', '#d61f4a'], ice: 1, mint: 1, gar: ['fresa'], straw: '#f4ead9', t: ['af'],
      af: L('Fresa y menta: el beso más fresco de la carta.', 'Maduixa i menta: el petó més fresc de la carta.', 'Strawberry and mint: the freshest kiss on the menu.', 'Fraise et menthe : le baiser le plus frais de la carte.') },
    { n: 'Caipiriña', p: 9.5, v: 'bajo', c: ['#f1f6d6', '#cfe39a'], ice: 1, lime: 1, gar: [], t: ['af'],
      af: L('Lima y cachaça. Brasil sabe de esto.', 'Llima i cachaça. El Brasil en sap, d’això.', 'Lime and cachaça. Brazil knows a thing or two.', 'Citron vert et cachaça. Le Brésil s’y connaît.') },
    { n: 'Tequila Sunrise', p: 9.5, v: 'alto', c: ['#ffd25a', '#ff8a2b', '#d81e3a'], ice: 1, gar: ['naranja', 'cereza'], straw: '#ff5a76' },
    { n: 'Piña Colada', p: 9.5, v: 'huracan', c: ['#fff6e2', '#f3dfb4'], gar: ['pina', 'sombrilla'], straw: '#ff5a76' },
    { n: 'Sex on the Beach', p: 9.5, v: 'huracan', c: ['#ffc07a', '#ff5d6c'], gar: ['naranja'], straw: '#f4ead9', t: ['af'],
      af: L('No hace falta explicarlo.', 'No cal explicar-ho.', 'No explanation needed.', 'Pas besoin d’explication.') },
    { n: 'Coco Loco', p: 9.5, v: 'coco', c: ['#fff8ec', '#efe2c9'], gar: ['flor'], straw: '#ff5a76', t: ['af'],
      af: L('Servido en coco. Las ganas de playa van incluidas.', 'Servit en coco. Les ganes de platja hi van incloses.', 'Served in a coconut. Beach cravings included.', 'Servi dans une noix de coco. L’envie de plage est incluse.') },
    { n: 'Aperol Spritz', p: 7, v: 'copa', c: ['#ffa24a', '#ff6a1a'], ice: 1, bubbles: 1, gar: ['naranja'] },
    { n: 'Margarita', p: 9, v: 'margarita', c: ['#f2f6cf', '#d7e79f'], salt: 1, gar: ['lima'] },
    { n: 'Bloody Mary', p: 9, v: 'alto', c: ['#c4182f', '#8c0f22'], ice: 1, gar: ['apio', 'limon'] },
    { n: 'San Francisco', p: 8.5, v: 'coupe', c: ['#ffc15a', '#ff6f5c'], gar: ['naranja', 'cereza'] },
    { n: 'San Francisco 0,0', p: 7.5, v: 'coupe', c: ['#ffd27a', '#ff8a6c'], gar: ['naranja'], zero: 1 }
  ];

  const batidos = [
    ['Maracuyá', '#f2c230', 'af'], ['Mango', '#ff9f1c'], ['Colombia', '#e8413b'], ['Miami', '#ff7aa2'],
    ['Piña Colada', '#f6e7c1'], ['Cocofresa', '#f05a7e'], ['Guanábana', '#e9efd9'], ['Superfresas', '#d6234a'],
    ['Islas Canarias', '#ffb547'], ['Salpicón', '#ff6a3d'], ['Vitamina completa', '#9bd16a']
  ];
  const batidoAf = L('Maracuyá es la fruta de la pasión. Sin metáforas.', 'La maracujà és la fruita de la passió. Sense metàfores.', 'Maracuyá is passion fruit. No metaphor needed.', 'Le maracuja, c’est le fruit de la passion. Sans métaphore.');

  const smoothies = [L('Plátano', 'Plàtan', 'Banana', 'Banane'), L('Fresa', 'Maduixa', 'Strawberry', 'Fraise'), L('Coco', 'Coco', 'Coconut', 'Coco'), L('Mango', 'Mango', 'Mango', 'Mangue')];

  const sangria = [
    [L('Sangría de vino (1 L)', 'Sangria de vi (1 L)', 'Red wine sangria (1 L)', 'Sangria au vin (1 L)'), 12.5],
    [L('Sangría de cava (1 L)', 'Sangria de cava (1 L)', 'Cava sangria (1 L)', 'Sangria au cava (1 L)'), 15],
    [L('Copa grande de sangría', 'Copa gran de sangria', 'Large glass of sangria', 'Grand verre de sangria'), 5]
  ];

  window.CARTA = { L, SIDES, cats, copas, batidos, batidoAf, smoothies, sangria };
})();
