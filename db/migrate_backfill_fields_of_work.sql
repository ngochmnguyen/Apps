-- Backfills the field-of-work taxonomy (see migrate_add_fields_of_work.sql, which
-- must run BEFORE this one) onto the ~135 opportunities already ingested into
-- production. Matched by source_url since that's stable across re-ingests.
-- Safe to re-run: ON CONFLICT DO NOTHING on the composite PK.

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'science_technology' FROM opportunities WHERE source_url IN (
  'https://admissions.kaust.edu.sa/fees-funding',
  'https://admissions.kaust.edu.sa/study/internships',
  'https://careers.cern/programmes/summer-studentship/',
  'https://deeplearningindaba.com/2026/applications/',
  'https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/attend/scholarships-travel-funding/',
  'https://falling-walls.com/lab',
  'https://ghc.anitab.org/awards-programs/scholarships',
  'https://ghci.anitabindia.org/',
  'https://iaeste.org/member-countries/ghana',
  'https://mbzuai.ac.ae/study/graduate-admission-process/',
  'https://neurips.cc/Conferences/2026',
  'https://princint.ai/programs/fellowship/',
  'https://www.africa.engineering.cmu.edu/impact/mastercard-foundation-scholars.html',
  'https://www.apnic.net/community/fellowship/',
  'https://www.daad.in/en/study-research-in-germany/studying-in-germany/internships-and-short-term-programmes/',
  'https://www.huawei.com/en/seeds-for-the-future/competitions',
  'https://www.ku.ac.ae/scholarships',
  'https://www.lacnic.net/3827/2/lacnic/lacnic-fellowship-program',
  'https://www.searca.org/scholarships',
  'https://www.stias.ac.za/fellowships/apply/',
  'https://www.techwomen.org/faq/participants'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'international_relations' FROM opportunities WHERE source_url IN (
  'https://exchanges.state.gov/non-us/program/fulbright-foreign-student-program',
  'https://exchanges.state.gov/us/program/congress-bundestag-youth-exchange-young-professionals-cbyx',
  'https://symposium.org/initiatives/global-essay-competition/',
  'https://worldfellows.yale.edu/the-program/application/',
  'https://www.chevening.org/apply/',
  'https://www.educanada.ca/scholarships-bourses/can/institutions/elap-pfla.aspx?lang=eng',
  'https://www.efworld.org/2027-globalprogram-eligibilty-criteria/',
  'https://www.global-changemakers.net/gys2026',
  'https://www.hpair.org/aconf',
  'https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/german-chancellor-fellowship',
  'https://www.iom.int/internship-programme',
  'https://www.obama.org/programs/scholars/columbia-university/',
  'https://www.ohchr.org/en/about-us/fellowship-programmes/fellowship-programme-people-african-descent',
  'https://www.oneyoungworld.com/scholarship/leading-scholarship-2026',
  'https://www.rotary.org/en/our-programs/peace-fellowships',
  'https://www.schwarzmanscholars.org/admissions/',
  'https://www.unv.org/unv-countries/uzbekistan',
  'https://www.ysealipfp.org/',
  'https://www.zayededucationfoundation.org/en/leadership/UAE-India-leaders-program',
  'https://ylai.state.gov/fellowship/'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'social_impact_development' FROM opportunities WHERE source_url IN (
  'https://aif.org/fellowship/apply-for-service-in-india/',
  'https://ashesi.edu.gh/the-mastercard-foundation-scholars-program/',
  'https://ghc.anitab.org/awards-programs/scholarships',
  'https://ghci.anitabindia.org/',
  'https://solve.mit.edu/challenges',
  'https://www.americorps.gov/serve/americorps/americorps-nccc',
  'https://www.australianvolunteers.com/volunteering/',
  'https://www.camphill.org.za/volunteer',
  'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/',
  'https://www.dfat.gov.au/people-people/australia-awards/australia-awards-fellowships',
  'https://www.global-changemakers.net/gys2026',
  'https://www.hultprize.org/competition/global-finals',
  'https://www.iasociety.org/conferences/aids2026/take-part/scholarships',
  'https://www.iom.int/internship-programme',
  'https://www.mandelarhodes.org/scholarship/apply/',
  'https://www.mandelawashingtonfellowship.org/',
  'https://www.obama.org/programs/scholars/columbia-university/',
  'https://www.ohchr.org/en/about-us/fellowship-programmes/fellowship-programme-people-african-descent',
  'https://www.oneyoungworld.com/scholarship/leading-scholarship-2026',
  'https://www.peacecorps.gov/fiji/',
  'https://www.peacecorps.gov/ghana/',
  'https://www.peacecorps.gov/kyrgyz-republic/',
  'https://www.peacecorps.gov/mongolia/',
  'https://www.princetoninafrica.org/applicants/how-to-apply/',
  'https://www.princetoninasia.org/fellowships',
  'https://www.rotary.org/en/our-programs/peace-fellowships',
  'https://www.techwomen.org/faq/participants',
  'https://www.unv.org/unv-countries/uzbekistan',
  'https://www.vsointernational.org/our-work/where-we-work/kenya/volunteering-in-kenya',
  'https://www.weltwaerts.de/en/requirements-volunteers.html',
  'https://www.ysealipfp.org/',
  'https://yali.state.gov/mwf/',
  'https://zayedsustainabilityprize.com/en/how-to-apply'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'education' FROM opportunities WHERE source_url IN (
  'https://a2ascholarships.iccr.gov.in/',
  'https://admission.study-in-egypt.gov.eg',
  'https://admissions.kaust.edu.sa/fees-funding',
  'https://arabiccenter.ksaa.gov.sa',
  'https://ashesi.edu.gh/the-mastercard-foundation-scholars-program/',
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships-applications/',
  'https://epik.go.kr/web/epik/main',
  'https://exchanges.state.gov/non-us/program/fulbright-foreign-student-program',
  'https://exchanges.state.gov/us/program/congress-bundestag-youth-exchange-young-professionals-cbyx',
  'https://foreign.fulbrightonline.org/about/flta-program',
  'https://fulbright.org.ph/',
  'https://knight-hennessy.stanford.edu/admission/before-you-apply/eligibility',
  'https://kz.usembassy.gov/global-undergraduate-exchange-program-global-ugrad/',
  'https://mbzuai.ac.ae/study/graduate-admission-process/',
  'https://mn.usembassy.gov/fulbright-english-teaching-assistant-program/',
  'https://studyinchina.csc.edu.cn/',
  'https://us.fulbrightonline.org/applicants/types-of-awards/english-teaching-assistant-awards',
  'https://us.fulbrightonline.org/countries/south-and-central-asia/kazakhstan/1615',
  'https://us.fulbrightonline.org/countries/western-hemisphere/argentina/1766',
  'https://us.fulbrightonline.org/countries/western-hemisphere/brazil/1628',
  'https://us.fulbrightonline.org/countries/western-hemisphere/mexico/1646',
  'https://wikimania.wikimedia.org/wiki/2026:Scholarships',
  'https://www.africa.engineering.cmu.edu/impact/mastercard-foundation-scholars.html',
  'https://www.ahlan-world.org/internship-volunteer-financial-aid/',
  'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program',
  'https://www.chevening.org/apply/',
  'https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/',
  'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
  'https://www.eastwestcenter.org/apply/us-south-pacific-scholarship-program',
  'https://www.educanada.ca/scholarships-bourses/can/institutions/elap-pfla.aspx?lang=eng',
  'https://www.gatescambridge.org/apply/how-to-apply/',
  'https://www.gob.mx/amexcid/acciones-y-programas/becas-para-extranjeros-29785',
  'https://www.gov.br/mre/pt-br/assuntos/cultura-e-educacao/temas-educacionais/programas-de-estudo-para-estrangeiros/pec-pg-pos-graduacao-1/sobre-o-pec-pg',
  'https://www.ku.ac.ae/scholarships',
  'https://www.mandelarhodes.org/scholarship/apply/',
  'https://www.mbru.ac.ae/scholarships/',
  'https://www.niied.go.kr/web/niied/contents/niiedEng/eng_gksDegree',
  'https://www.peacecorps.gov/ghana/',
  'https://www.peacecorps.gov/kyrgyz-republic/',
  'https://www.peacecorps.gov/mexico/',
  'https://www.peacecorps.gov/mongolia/',
  'https://www.peacecorps.gov/viet-nam/',
  'https://www.princetoninasia.org/fellowships',
  'https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships',
  'https://www.schwarzmanscholars.org/admissions/',
  'https://www.uaeu.ac.ae/en/cgs/phd_fellowship_all.shtml',
  'https://www.vsointernational.org/volunteering/strengthening-english-language-education-in-uzbekistan',
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50026200'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'government_public_policy' FROM opportunities WHERE source_url IN (
  'https://worldfellows.yale.edu/the-program/application/',
  'https://www.chevening.org/apply/',
  'https://www.dfat.gov.au/people-people/australia-awards/australia-awards-fellowships',
  'https://www.dubaifuture.ae/feel-2026/',
  'https://www.efworld.org/2027-globalprogram-eligibilty-criteria/',
  'https://www.hpair.org/aconf',
  'https://www.mandelarhodes.org/scholarship/apply/',
  'https://www.mandelawashingtonfellowship.org/',
  'https://www.obama.org/programs/scholars/columbia-university/',
  'https://www.schwarzmanscholars.org/admissions/',
  'https://www.ysealipfp.org/',
  'https://www.zayededucationfoundation.org/en/leadership/UAE-India-leaders-program',
  'https://yali.state.gov/mwf/'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'arts_culture' FROM opportunities WHERE source_url IN (
  'https://artomi.org/residencies/art/',
  'https://camargofoundation.org/current-calls/camargo-fellowship/',
  'https://casawabi.org/en/events/fundacion-casa-wabi-artreview-prize-2026/',
  'https://ccat.uz/en/residencies',
  'https://k3-hamburg.de/en/professionals/residencyapplicationform',
  'https://kuonatrust.org/kuona-trust-residency/',
  'https://miskartinstitute.org/en/residencies/masaha',
  'https://sacatar.org/en/apply/',
  'https://vaslart.org/residency/international-artists-residency/',
  'https://www.421.online/opportunities/residency-program-2026/',
  'https://www.akademie-solitude.de/en/fellowship/solitude-fellowship/',
  'https://www.audleytravel.com/photography-competition',
  'https://www.canneslions.com/learning/competitions',
  'https://www.citeinternationaledesarts.fr/en/programme-de-residence/kota/',
  'https://www.citeinternationaledesarts.fr/en/programmes-de-residence/',
  'https://www.comedywildlifephoto.com/competition/prizes.php',
  'https://www.delfinafoundation.com/open-calls/current/',
  'https://www.dotateliers.space/apply',
  'https://www.lawayakacurrent.com/desert',
  'https://www.mmca.go.kr/eng/artStudio/artStudioMain.do',
  'https://www.sharjahart.org/en/studio-residency-programmes/',
  'https://www.stias.ac.za/fellowships/apply/',
  'https://www.sunwing.ca/en/canadas-next-top-creators',
  'https://www.vac.art/residency',
  'https://www.vcca.com/apply/fully-funded-fellowships/',
  'https://www.worldphoto.org/sony-world-photography-awards/open'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'journalism_media' FROM opportunities WHERE source_url IN (
  'https://karshfellowship.org/apply/',
  'https://wikimania.wikimedia.org/wiki/2026:Scholarships',
  'https://www.sunwing.ca/en/canadas-next-top-creators'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'law' FROM opportunities WHERE source_url IN (
  'https://www.ohchr.org/en/about-us/fellowship-programmes/fellowship-programme-people-african-descent'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'business_entrepreneurship' FROM opportunities WHERE source_url IN (
  'https://aiesec.ke/',
  'https://eonetwork.org/gsea',
  'https://falling-walls.com/lab',
  'https://solve.mit.edu/challenges',
  'https://startupchile.org/en/apply/',
  'https://www.aiesec.org.ar/',
  'https://www.canneslions.com/learning/competitions',
  'https://www.dubaifuture.ae/feel-2026/',
  'https://www.hultprize.org/competition/global-finals',
  'https://www.mandelawashingtonfellowship.org/',
  'https://www.seedstarsworld.com/local-competitions/',
  'https://yali.state.gov/mwf/',
  'https://ylai.state.gov/fellowship/'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'literature_writing' FROM opportunities WHERE source_url IN (
  'https://camargofoundation.org/current-calls/camargo-fellowship/',
  'https://fondation-janmichalski.com/en/residences',
  'https://rem.malba.org.ar/en/',
  'https://writezakama.wordpress.com/2026/06/26/call-for-applications-ana-ken-saro-wiwa-international-writers-residency-2026-edition/',
  'https://www.sangamhouse.org/the-application/',
  'https://www.sharjahart.org/en/studio-residency-programmes/',
  'https://www.vcca.com/apply/fully-funded-fellowships/'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'environment_sustainability' FROM opportunities WHERE source_url IN (
  'https://www.comedywildlifephoto.com/competition/prizes.php',
  'https://www.peacecorps.gov/mexico/',
  'https://www.princetoninafrica.org/applicants/how-to-apply/',
  'https://www.searca.org/scholarships',
  'https://zayedsustainabilityprize.com/en/how-to-apply'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'health_medicine' FROM opportunities WHERE source_url IN (
  'https://www.camphill.org.za/volunteer',
  'https://www.iasociety.org/conferences/aids2026/take-part/scholarships',
  'https://www.mbru.ac.ae/scholarships/',
  'https://www.vsointernational.org/our-work/where-we-work/kenya/volunteering-in-kenya'
)
ON CONFLICT DO NOTHING;

INSERT INTO opportunity_fields_of_work (opportunity_id, field)
SELECT id, 'finance_economics' FROM opportunities WHERE source_url IN (
  'https://symposium.org/initiatives/global-essay-competition/',
  'https://www.hpair.org/aconf'
)
ON CONFLICT DO NOTHING;

