/* =====================================================================
   DATA — star catalog, constellation figures, and the fifteen nodes.
   Geometry is real: epoch-J2000 RA/Dec, equirectangular projection.
   Edit NODES freely; everything else is the sky.
   ===================================================================== */

// [name, RA hours, Dec deg, visual magnitude]
window.CAT = [
 ["Alpheratz",0.14,29.09,2.06],["Diphda",0.73,-17.99,2.04],["Navi",0.95,60.72,2.15],
 ["Achernar",1.63,-57.24,0.46],["Acamar",2.97,-40.30,2.90],["Menkar",3.04,4.09,2.53],
 ["Mirfak",3.41,49.86,1.79],["Aldebaran",4.60,16.51,0.85],["Rigel",5.24,-8.20,0.12],
 ["Capella",5.28,46.00,0.08],["Canopus",6.40,-52.70,-0.72],["Sirius",6.75,-16.72,-1.46],
 ["Procyon",7.66,5.22,0.38],["Regor",8.16,-47.34,1.78],["Dnoces",8.99,48.04,3.14],
 ["Alphard",9.46,-8.66,1.98],["Regulus",10.14,11.97,1.35],["Denebola",11.82,14.57,2.14],
 ["Gienah",12.26,-17.54,2.59],["Acrux",12.44,-63.10,0.77],["Spica",13.42,-11.16,0.98],
 ["Alkaid",13.79,49.31,1.86],["Menkent",14.11,-36.37,2.06],["Arcturus",14.26,19.18,-0.04],
 ["Alphecca",15.58,26.71,2.23],["Antares",16.49,-26.43,0.96],["Atria",16.81,-69.03,1.92],
 ["Rasalhague",17.58,12.56,2.08],["Vega",18.62,38.78,0.03],["Nunki",18.92,-26.30,2.02],
 ["Altair",19.85,8.87,0.77],["Dabih",20.35,-14.78,3.08],["Peacock",20.43,-56.74,1.94],
 ["Deneb",20.69,45.28,1.25],["Enif",21.74,9.88,2.39],["Fomalhaut",22.96,-29.62,1.16],

 ["Betelgeuse",5.92,7.41,0.50],["Bellatrix",5.42,6.35,1.64],["Mintaka",5.53,-0.30,2.23],
 ["Alnilam",5.60,-1.20,1.70],["Alnitak",5.68,-1.94,1.77],["Saiph",5.80,-9.67,2.06],
 ["Castor",7.58,31.89,1.58],["Pollux",7.76,28.03,1.14],["Alhena",6.63,16.40,1.93],
 ["Adhara",6.98,-28.97,1.50],["Wezen",7.14,-26.39,1.83],["Mirzam",6.38,-17.96,1.98],
 ["Dubhe",11.06,61.75,1.79],["Merak",11.03,56.38,2.37],["Phecda",11.90,53.69,2.44],
 ["Megrez",12.26,57.03,3.31],["Alioth",12.90,55.96,1.77],["Mizar",13.40,54.93,2.27],
 ["Schedar",0.68,56.54,2.24],["Caph",0.15,59.15,2.27],["Ruchbah",1.43,60.24,2.68],
 ["Segin",1.91,63.67,3.38],["Sadr",20.37,40.26,2.23],["Albireo",19.51,27.96,3.18],
 ["GienahCyg",20.77,33.97,2.48],["DeltaCyg",19.75,45.13,2.87],["Markab",23.08,15.21,2.49],
 ["Scheat",23.06,28.08,2.42],["Algenib",0.22,15.18,2.83],["Mirach",1.16,35.62,2.05],
 ["Almach",2.06,42.33,2.10],["Hamal",2.12,23.46,2.00],["Algol",3.14,40.96,2.12],
 ["Elnath",5.44,28.61,1.65],["Alcyone",3.79,24.11,2.87],["Miaplacidus",9.22,-69.72,1.68],
 ["Avior",8.38,-59.51,1.86],["Aspidiske",9.28,-59.28,2.21],["Gacrux",12.52,-57.11,1.63],
 ["Mimosa",12.80,-59.69,1.25],["DeltaCru",12.25,-58.75,2.79],["Hadar",14.06,-60.37,0.61],
 ["RigilKent",14.66,-60.83,-0.27],["Shaula",17.56,-37.10,1.62],["Sargas",17.62,-42.99,1.86],
 ["Dschubba",16.01,-22.62,2.29],["Graffias",16.09,-19.81,2.62],["KausAus",18.40,-34.38,1.85],
 ["Etamin",17.94,51.49,2.23],["Zubenelgenubi",14.85,-16.04,2.75],["Sabik",17.17,-15.72,2.43],
 ["Algieba",10.33,19.84,2.08],["Zosma",11.24,20.52,2.56],["Algorab",12.50,-16.52,2.94],
 ["Ankaa",0.44,-42.31,2.38],["Muphrid",13.91,18.40,2.68],["Izar",14.75,27.07,2.37],
 ["Seginus",14.53,38.31,3.03],["Nekkar",15.03,40.39,3.49],["Porrima",12.69,-1.45,2.74],
 ["Vindemiatrix",13.04,10.96,2.83],["Kornephoros",16.50,21.49,2.77]
];

window.FIGURES = [
 ["Betelgeuse","Bellatrix"],["Bellatrix","Mintaka"],["Mintaka","Alnilam"],["Alnilam","Alnitak"],
 ["Alnitak","Saiph"],["Saiph","Rigel"],["Rigel","Mintaka"],["Betelgeuse","Alnitak"],
 ["Dubhe","Merak"],["Merak","Phecda"],["Phecda","Megrez"],["Megrez","Alioth"],
 ["Alioth","Mizar"],["Mizar","Alkaid"],["Megrez","Dubhe"],
 ["Caph","Schedar"],["Schedar","Navi"],["Navi","Ruchbah"],["Ruchbah","Segin"],
 ["Deneb","Sadr"],["Sadr","Albireo"],["GienahCyg","Sadr"],["Sadr","DeltaCyg"],
 ["Graffias","Dschubba"],["Dschubba","Antares"],["Antares","Sargas"],["Sargas","Shaula"],
 ["Acrux","Gacrux"],["Mimosa","DeltaCru"],
 ["Regulus","Algieba"],["Algieba","Zosma"],["Zosma","Denebola"],
 ["Arcturus","Muphrid"],["Arcturus","Izar"],["Izar","Seginus"],["Seginus","Nekkar"],
 ["Sirius","Mirzam"],["Sirius","Adhara"],["Adhara","Wezen"],["Wezen","Sirius"],
 ["Castor","Pollux"],["Pollux","Alhena"],
 ["Markab","Scheat"],["Scheat","Alpheratz"],["Alpheratz","Algenib"],["Algenib","Markab"],
 ["RigilKent","Hadar"],["Hadar","Menkent"],
 ["Vega","Deneb"],["Deneb","Altair"],["Altair","Vega"]
];

/* ---------------------------------------------------------------------
   THE EXPERIENCES.

   star  : which catalogue star this sits on (must exist in CAT)
   w     : 1 flagship / 2 major / 3 standard — drives node size
   thumb : card/modal artwork. Real photographs where they exist;
           otherwise generated line art (tools/make-art.py).
   desc  : the one-liner on the card
   pts   : the card's bullets — the short version
   story : the full write-up, one string per paragraph. Shown in the
           "Read more" modal. Supports [label](url) links, nothing else.
   href  : an outbound link shown at the foot of the modal
   cta   : optional label for that link (defaults to "Learn more")

   Stars are chosen for spread, not meaning — and prefer RA 4h–21h so
   the chart never has to shrink to keep a node on screen.
   --------------------------------------------------------------------- */
window.NODES = [
 {star:"Vega", w:1, title:"LotusFlare",
  role:"Technical Program Lead", year:"2024\u201325", tags:["Telecom", "Product"],
  href:"https://www.linkedin.com/pulse/khaleesi-his-3-product-managers-thip-bala-gp69e/", cta:"Read: my three dragons", thumb:"assets/img/lotusflare.svg",
  desc:"What goes into launching a phone company?",
  pts:[
       "Launched Your Name Wireless with T-Mobile \u2014 end to end, in six months.",
       "Built SmartLess Mobile with Jason Bateman and Will Arnett; it landed on Jimmy Kimmel.",
       "Now the cheapest and most accessible wireless network in the US.",
       "Connected BE, FE, QA, product and client teams that had been working in silos."
      ],
  story:[
   "I joined LotusFlare on a whim back in the spring of 2024, off a recommendation from a dear friend from SkyWatch. They were looking for a technical lead to help manage their upcoming projects with T-Mobile. What I didn\u2019t expect was that I would be launching telecom services for celebrities.",

   "Over the year and a half I spent at LotusFlare, I basically dipped my toes into both engineering and management through a solution with T-Mobile called Your Name Wireless. You can see SmartLess Mobile as one example, where I got to work directly with Arrested Development co-stars Jason Bateman and Will Arnett\u2014two of my favourite actors of all time\u2014as they took on this challenge. It was even featured on [Jimmy Kimmel](https://www.youtube.com/watch?v=pe1sl0xMv30) and is now the cheapest and most accessible wireless network across the US.",

   "What also came out of my experience with LotusFlare was a much deeper understanding of end-to-end web and app development, including the coordination and management of all these development teams that often worked in silos simply because their workloads were so intense. I learned how to connect the dots between BE, FE, QA, product, and client teams, while also getting way more comfortable with product management and leading sprints than I ever expected. You can see more about that side of the experience in [this article](https://www.linkedin.com/pulse/khaleesi-his-3-product-managers-thip-bala-gp69e/) I wrote about my three dragons.",

   "And I still can\u2019t believe the nuances that went into operating your own telecom company under the biggest network in North America. There were constraints and limitations with every aspect of this development, but it was also crazy how such a simple utility as having a phone connected to a network can require so much more technical depth than I\u2019m even used to. That\u2019s coming from someone who\u2019s worked in the space sector.",

   "More than anything, LotusFlare was where I started to really grow into a technical program lead. I came out of the experience much more comfortable operating at the intersection of engineering, product, and clients, and with a much better understanding of what it takes to actually get a complicated technical product out the door. And fast. My god, we had to launch this in 6 months, that\u2019s not as easy as it sounds."
  ]},

 {star:"Capella", w:1, title:"SkyWatch",
  role:"Strategic Partnerships Lead", year:"2021", tags:["Space", "Partnerships"],
  href:"https://earth.esa.int/eogateway/tools/snap", cta:"Explore SNAP", thumb:"assets/img/skywatch.svg",
  desc:"Building toolkits with space agencies for anyone who needs space data.",
  pts:[
       "Led partnership programs with the Canadian and European Space Agencies.",
       "Our engineering shipped into ESA\u2019s open-source SNAP toolbox \u2014 cloud masking, imagery mosaicing.",
       "Ran multi-year Agile programs across EarthCache and TerraStream.",
       "Got Scrum certified somewhere in the middle of it."
      ],
  story:[
   "Back in 2021, finding work was tough. COVID was rampant, and space tech companies were (and still are) pretty scarce here in Canada. I made the life-changing decision to pursue grad school in the UK, but the same week I got my acceptance letter, SkyWatch offered me a job leading their strategic partnership projects. It was a tough decision, but I\u2019m eternally grateful to them for giving me that opportunity\u2014and for trusting me with it.",

   "This was my first real exposure to Agile development and Scrum frameworks. I even got my Scrum certification because I was managing multiple multi-year projects across a whole bunch of teams, while also overseeing the internal development of our product suite. At the time, SkyWatch had two awesome offerings: EarthCache\u2014the Amazon for geospatial data\u2014and TerraStream\u2014the Shopify for geospatial data (which is actually how it was branded). The former made it possible for pretty much anyone, anywhere in the world to access a suite of Earth observation data sources for their applications. The latter gave satellite operators a way to sell their data directly to high-value customers. And all of it was accessible through web apps and APIs.",

   "SkyWatch had some amazing partnerships too \u2014 that was the forefront of my work there. I got to build relationships with both the Canadian Space Agency (CSA) and the European Space Agency (ESA), working directly with their smartEarth and ISC programs. [SNAP](https://earth.esa.int/eogateway/tools/snap) was far and away my favourite. Our work was being used directly in this open-source tool alongside the Sentinel suite of toolboxes. Cloud masking, imagery mosaicing\u2014all of it was enabled through our engineering team for the world. I\u2019m still browsing SNAP every now and then to see what\u2019s available.",

   "Being able to watch the iterative development of some of the coolest space-tech applications out there, while actually contributing to the partnerships and engineering behind them, was truly special. Who knows where I would be if I had gone to grad school, but I know I wouldn\u2019t be here without my time at SkyWatch. It was really the first place where I got to see how technology, engineering, partnerships, and customers all come together to turn an idea into something people actually use."
  ]},

 {star:"Antares", w:1, title:"ESSENCE",
  role:"Mission Coordinator", year:"2020", tags:["Space", "Hardware", "CSA"],
  href:"#", thumb:"assets/img/essence.svg",
  desc:"What went into launching my first CubeSat?",
  pts:[
       "A 3U CubeSat built and flown through the Canadian Space Agency\u2019s CubeSat Project.",
       "Wrote the PRDs, mission and payload requirements, and secured the partners and funding.",
       "Carried an Arctic permafrost camera and a proton detector built with the University of Sydney.",
       "Still drifting around in low Earth orbit. I call it my first because it won\u2019t be my last."
      ],
  story:[
   "Back in 2020, I had just finished my undergraduate degree in Space Engineering and had no idea what came next. I was trying to figure out how to turn being a qualified space engineer into something tangible. Thankfully, a couple of graduate students showed me exactly what that could look like when they asked me to help coordinate the launch of the CubeSat we were building with the CSA.",

   "The CSA runs the Canadian CubeSat Project, which gives universities across Canada the opportunity to design, build, launch, and operate a 3U CubeSat. That\u2019s kind of insane for anyone, let alone a group of students without any formal space engineering experience. Universities are great at giving students opportunities, but a lot of them can still feel theoretical or simulation-based. This was different. We were building something with our own hands, sending it into space, and designing it around a real-world problem. That\u2019s how we came up with ESSENCE.",

   "The early stages were honestly where I learned the most. Before the engineers started building hardware, we had to figure out what we were actually building. We wrote PRDs, put together technical presentations, defined mission and payload requirements, and spent months reaching out to potential partners and securing funding and support from organizations around the world. My role was largely about taking this early-stage idea and turning it into something that engineers, researchers, universities, and partners could actually get behind. Once the mission was defined and the pieces were in place, the engineering teams took over the design and build, while we helped oversee the integration of the 3U CubeSat and made sure everything came together as one mission.",

   "The satellite itself carried two payloads focused on climate and space-environment research. The first was a wide-angle camera designed to capture imagery of the Canadian Arctic, particularly to help monitor thawing permafrost and Arctic ice. The second was a proton detector developed in partnership with the University of Sydney to collect data on energetic solar protons from solar storms in low Earth orbit.",

   "Fast forward to today, and ESSENCE is drifting around in low Earth orbit as a piece of space hardware. But for a while, it was something we had designed, integrated, tested, and actually sent into space. More importantly, it gave me my first real taste of taking an idea from a document and a PowerPoint deck all the way to something that physically leaves the planet.",

   "Still feels surreal to this day. I still call it my first because I know it won\u2019t be my last."
  ]},

 {star:"Arcturus", w:2, title:"LiveEO",
  role:"Solutions Engineer", year:"2022\u201323", tags:["Geospatial", "ML"],
  href:"https://lnkd.in/p/g5Av3ESv", cta:"Read the write-up", thumb:"assets/img/liveeo.svg",
  desc:"How we mitigated risk across the world with geospatial data.",
  pts:[
       "Only technical engineer in North America, running every client across the Americas.",
       "Oversaw solutions across tens of thousands of kilometres of grid, rail and pipeline.",
       "Satellite imagery turned into vegetation, wildfire and deforestation risk.",
       "Project Lead \u2192 Solutions Engineer \u2192 Enterprise Account Executive."
      ],
  story:[
   "My German is now awful, but when I was living in Berlin back in Fall 2022, it was schrecklich. That means terrible in German, but slightly less than awful.",

   "Our division in North America was pretty small, and I was the only technical engineer here\u2014working out of Toronto and managing pretty much every client we had across the Americas. Meanwhile, the team in Berlin and across Europe was working on one of the most fascinating applications of geospatial data and machine learning I\u2019d ever seen: using satellite imagery to better understand and protect critical infrastructure across Europe.",

   "The foundation of LiveEO\u2019s tech stack is actually pretty simple: take the Earth observation data we\u2019re getting from space and turn it into insights that can help mitigate vegetation encroachment, wildfire risk, deforestation exposure, and a whole lot more.",

   "I ended up overseeing solutions across tens of thousands of kilometres of network spanning Canada, North America, and parts of Europe. Electrical grids, rail networks, pipelines\u2014you name it, we were analyzing it with satellite data. And after jumping from Project Lead to Solutions Engineer to an actual Enterprise Account Executive (though, admittedly, I sucked at sales), the most rewarding part was getting to see the technology actually make its way into the operations of some of the world\u2019s biggest infrastructure companies.",

   "That\u2019s the beauty of space engineering. The work here wasn\u2019t stuck in outer space. We were taking insights from some pretty complex technology, understanding what a customer actually needed from it, and turning it into something they could use in the real world to improve efficiencies across their entire risk mitigation approach. There\u2019s more on that journey here: [LinkedIn article](https://lnkd.in/p/g5Av3ESv)."
  ]},

 {star:"Regulus", w:2, title:"The Knowledge Society",
  role:"Coach", year:"Now", tags:["Education", "Mentorship"],
  href:"https://www.youtube.com/watch?v=k1oO_HHPO5w", cta:"Watch a session", thumb:"assets/img/tks.webp",
  desc:"An olympics training ground for the world\u2019s youngest innovators.",
  pts:[
       "Weekend sessions for 200+ teenagers, September through June.",
       "Partnered with Meta, Microsoft and the UN \u2014 though the mentorship matters more than the logos.",
       "Watching a 15-year-old go from \u201cI have no idea what I\u2019m doing\u201d to funded is the whole job."
      ],
  story:[
   "The concept of a knowledge society in Ismaili teachings refers to a modern global environment where progress, economic success, and quality of life depend on the acquisition, creation, and application of knowledge rather than physical or material resources. That\u2019s the inspiration behind TKS\u2014the modern take on this idea, where we coach the brightest teenagers across the globe to innovate and become makers now, rather than waiting until they\u2019re adults to start doing something meaningful.",

   "From September through June, I spend my weekends running sessions for 200+ students, leveling up in what I can only describe as an almost Y Combinator-esque environment for teenagers. The focus is on real-world outcomes and applicable skills through portfolio building, personalized coaching, technical projects, and a ridiculous amount of experimentation. I tell people I\u2019m a teacher, but that\u2019s probably the farthest thing from the truth. This is a paradigm shift in how young innovators can develop themselves.",

   "They\u2019re building things, talking to experts, working with emerging technologies, and figuring out what they can actually contribute to the world. TKS has partnered with some of the biggest companies and organizations in the world\u2014Meta, the UN, Microsoft, to name a few\u2014to create an unquestionably unique experience for these teenagers. But even more important than the logos is the rigor of the mentorship. Watching a 15- or 16-year-old go from \u201cI have no idea what I\u2019m doing\u201d to confidently pitching something they\u2019ve built and securing an internship, a job, or even funding from investors is pretty incredible.",

   "A lot of my career has been about figuring out how to take complicated technology and turn it into something useful\u2014whether that was satellite data, telecom infrastructure, or even building my own CubeSat. At TKS, I get to do the inverse: take complicated ideas and make them accessible to someone just beginning their journey. I\u2019ve been working with students since I was a student myself, but this place feels uniquely suited to someone like me. Bridging their imaginative creativity with breakthrough technologies they may not have even known existed, and then giving them the tools, mentorship, and confidence to actually do something with them, feels pretty serendipitous to be a part of.",

   "Just look at the energy [from this session](https://www.youtube.com/watch?v=k1oO_HHPO5w) to see what I\u2019m talking about. And if you\u2019re curious about what we do, you can always check it out \ud83d\ude42"
  ]},

 {star:"Sirius", w:2, title:"Mammalian Diving Reflex",
  role:"Project Lead", year:"", tags:["Performance art", "Europe"],
  href:"#", thumb:"assets/img/mammalian.svg",
  desc:"What exactly is social acupuncture?",
  pts:[
       "Led performance-art projects across Europe, including a month on Unst, the northernmost inhabited island in Shetland.",
       "Haircuts given by ten-year-olds. City tours led by teenagers. Elders talking openly about their sex lives.",
       "Discomfort engineered on purpose, to hand people back a new kind of comfort.",
       "Half of my project management actually came from here, not from engineering."
      ],
  story:[
   "When I mention mammalian diving reflex, people usually assume I either worked in biomedical engineering for a bit or got to work closely with marine animals. And I guess, technically, I was working with mammals\u2014more specifically, humans. But this was actually the first time I got to seriously explore performance art. In fact, a lot of who I am today, especially when it comes to creativity and art, comes from the work I got to do here.",

   "If you just glance at the Mammalian website, you\u2019ll get a quick overview of what they\u2019re all about, but it\u2019s almost impossible to explain without actually experiencing the work that the artists there create. We were essentially creating social experiences through discomfort, which already sounds a little strange when you say it out loud. Essentially, imagine:",

   "- You get to listen to a panel of elderly people talk openly about their sex lives.",

   "- You get a haircut, but the person cutting it is a 10-year-old who has spent the past week being trained by professional barbers.",

   "- You get a tour of a city you\u2019ve lived in your entire life, but your guide is a group of teenagers.",

   "These were some of the projects I got to lead across a multitude of countries in Europe, including some pretty obscure ones. One that really sticks with me was the month I spent in Unst, the northernmost inhabited island in Shetland, just north of Scotland. Some of the stuff we were doing there was kind of insane. In fact, now that I think about it, most of my project management experience came from these unconventional experiences.",

   "The concepts behind these projects were driven by a social construct developed by our lead director, who coined the term \u201csocial acupuncture\u201d: creating moments of discomfort in social settings that ultimately give people a new sense of comfort, connection, or perspective. While I was juggling a degree in space engineering, I was also spending weeks at a time running these kinds of artistic experiences at festivals, theatres, and communities across Europe.",

   "Looking back, it was a pretty unusual combination. On one side, I was studying space engineering and thinking about satellites, physics, and hard technical problems. On the other hand, I was designing experiences that forced people to question their assumptions about other people and themselves. But I think that tension is a big part of what made me who I am: half wacky, half technical. And more importantly, experiences like this taught me to not be afraid of ideas that initially seem completely insane."
  ]},

 {star:"Deneb", w:2, title:"Palan Works",
  role:"Creative & Product Lead", year:"2020\u2013", tags:["Writing", "Film"],
  href:"#", thumb:"assets/img/palan.svg",
  desc:"Turns out I\u2019m a writer as well.",
  pts:[
       "Films, web series, festival pitches and cultural experiences across North America.",
       "Started in COVID as a way to use the strange amount of free time. It became more than that.",
       "Scripts, campaigns, and the occasional weird idea that turns into something real."
      ],
  story:[
   "I still struggle to call myself a writer because it feels egotistical. Everyone is a writer. Everyone is a storyteller. Even writing this feels a little lame. But a close friend once told me that she could feel my personality in my writing, and I\u2019ve always loved that. Whenever she read something I had written, she\u2019d point out the parts where it actually felt like I was talking to her on the page. That always brought a smile to my face.",

   "In that sense, the work I get to do with Palan is some of the most soul-lifting work I get to be a part of. I get to work with a creatively distinct group of people who are trying to elevate not just art, but the creative experiences people have around the world. We started during COVID, thinking it would be a good time to use the strange amount of free time we suddenly had to make some fun projects. Somehow, that turned into so much more. We\u2019ve worked on films, written web series, pitched at festivals around the world, and created cultural and creative experiences across North America. And we\u2019re still pursuing all of it.",

   "As one of the creative and product leads on the team, I\u2019ve also had the chance to do more than just write. I get to help actually engineer these experiences\u2014figuring out how an idea, a piece of content, or a work of art can come together. A script for a music video? The writing for a marketing campaign? A weird idea that somehow turns into something real? Palan gives me a place to bridge my love for technology with my love for creativity, and stay tuned for what I mean by that.",

   "People think I\u2019m creative, but honestly, I feel most creative when I\u2019m just writing on a piece of paper, finishing a script, or taking an idea and figuring out what it could become. Even getting the copy for this website felt a little annoying at first, but as I\u2019m writing this for you to read, I\u2019m having a lot of fun. And maybe that\u2019s what I like most about writing: not necessarily the idea of being a writer, but the feeling of taking something that exists entirely in my head and putting it somewhere other people can experience it.",

   "That\u2019s what I like to think of my work with Palan as\u2014both what we\u2019ve made and what\u2019s still to come. It\u2019s a way of putting a part of myself out into the world and letting you see it through whatever medium makes the most sense. Sometimes that\u2019s a film. Sometimes it\u2019s a script. Sometimes it\u2019s a product. And sometimes, apparently, it\u2019s a very long paragraph on my personal website."
  ]},

 {star:"Spica", w:3, title:"String Hoopers",
  role:"Founder", year:"2024", tags:["Non-profit", "Community"],
  href:"#", thumb:"assets/img/stringhoopers.svg",
  desc:"Can you cook on and off the court?",
  pts:[
       "A non-profit summer program built around basketball and food in Parkdale.",
       "Camps spanning sports analytics, media, mental health, cooking and photography.",
       "Named for the Tamil dish \u2014 a string hopper looks like the mesh on a basketball net.",
       "Basketball and food were the vehicle. The real thing we built was a community."
      ],
  story:[
   "A lot of who I am was because of basketball. You can see it in my LinkedIn blurb \u2014 \u201cball is life\u201d is the last thing because it\u2019s my foundation. And a lot of that happened in Parkdale for my friends and I. I was raised by this community, and anyone who has met me knows I talk about both Parkdale and basketball very fondly. They almost go hand-in-hand, but things aren\u2019t like that anymore. Teenagers spend their time indoors way more than when I was growing up. Community centres were filled to the brim with activities and programming for everyone. And I wanted to bring that back. So I started a non-profit called String Hoopers back in 2024.",

   "It\u2019s a play on the phrase String Hopper, which is a traditional Tamil dish made up of rice flour that is pressed into noodles. It also kind of looks like the mesh on a basketball net, and so we built our brand around these two concepts: basketball and food. Parkdale gave us a unique culinary experience with its diversity and intimate palette, and we wanted to bring that back with our summer program.",

   "The concept was simple: create a space where young people could come together, learn something new, play some basketball, eat some good food, and hopefully walk away feeling a little more connected to themselves and their community. But as we built the program, we realized it could be much more than that. Each training camp had a different focus, from sports analytics and media to mental health, cooking, photography, self-care, and team-building. The idea was to give these kids experiences that went beyond basketball, while still using basketball as the thing that brought everyone together.",

   "There\u2019s something really powerful about being surrounded by people who share parts of your childhood experience, while also being exposed to completely different perspectives, cultures, and interests. I started this because I missed what Parkdale had given me growing up, but I ended up realizing that what we were really building was a community. Basketball and food were the vehicle; the real goal was giving young people a place to learn, connect, and feel like they belonged."
  ]},

 {star:"Aldebaran", w:3, title:"SV Robotics",
  role:"Instructor", year:"", tags:["Robotics", "Education"],
  href:"#", thumb:"assets/img/svrobotics.svg",
  desc:"Teaching robotics to kids from the comfort of their home.",
  pts:[],
  story:[]},

 {star:"Rasalhague", w:3, title:"Castle Lane Digital",
  role:"", year:"", tags:[],
  href:"#", thumb:"assets/img/castlelane.svg",
  desc:"",
  pts:[],
  story:[]}
];

/* Footer links. Anything left as "#" is hidden rather than rendered as a
   dead link — see main.js. Fill one in and it appears. */
window.LINKS = {
  email:    "mailto:thipeeshanb@gmail.com",
  linkedin: "https://linkedin.com/in/thipeeshanb",
  listview: "#"
};
