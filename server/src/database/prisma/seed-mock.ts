import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding mock data...');

  // --- Product Categories ---
  const waterTank = await prisma.productCategory.create({
    data: { name: 'Water Tank', slug: 'water-tank', translations: JSON.stringify({ en: 'Water Tank', zh: '水箱' }), sortOrder: 0 },
  });
  const roSystem = await prisma.productCategory.create({
    data: { name: 'RO System', slug: 'ro-system', translations: JSON.stringify({ en: 'RO System', zh: '反渗透系统' }), sortOrder: 1 },
  });
  const filtration = await prisma.productCategory.create({
    data: { name: 'Filtration', slug: 'filtration', translations: JSON.stringify({ en: 'Filtration Equipment', zh: '过滤设备' }), sortOrder: 2 },
  });

  // --- Products ---
  const products = [
    { cat: waterTank.id, slug: 'ss304-water-tank-1000l', enName: 'SS304 Stainless Steel Water Tank 1000L', enDesc: 'High-quality 304 stainless steel water storage tank. Capacity 1000L, ideal for food, beverage, and pharmaceutical industries. Corrosion-resistant and durable.', zhName: 'SS304不锈钢水箱1000L', zhDesc: '高品质304不锈钢储水罐，容量1000升，适用于食品、饮料和制药行业。耐腐蚀、耐用。', params: [{ key_en: 'Material', key_zh: '材质', value: 'SS304/316' }, { key_en: 'Capacity', key_zh: '容量', value: '1000L' }, { key_en: 'Diameter', key_zh: '直径', value: '1050mm' }, { key_en: 'Height', key_zh: '高度', value: '1220mm' }], inds: ['Food & Beverage', 'Pharmaceutical', 'Chemical'] },
    { cat: waterTank.id, slug: 'ss316-water-tank-5000l', enName: 'SS316 Stainless Steel Water Tank 5000L', enDesc: 'Industrial-grade 316 stainless steel water tank. 5000L capacity with superior corrosion resistance for harsh chemical environments.', zhName: 'SS316不锈钢水箱5000L', zhDesc: '工业级316不锈钢水箱，5000升容量，具有卓越的耐腐蚀性，适用于苛刻化学环境。', params: [{ key_en: 'Material', key_zh: '材质', value: 'SS316' }, { key_en: 'Capacity', key_zh: '容量', value: '5000L' }, { key_en: 'Diameter', key_zh: '直径', value: '1800mm' }, { key_en: 'Height', key_zh: '高度', value: '2000mm' }], inds: ['Chemical', 'Industrial', 'Water Treatment'] },
    { cat: roSystem.id, slug: '1000lph-ro-system', enName: '1000LPH Reverse Osmosis Water Treatment System', enDesc: 'Complete RO water purification system with 1000L/hour capacity. Includes pre-treatment, membrane filtration, and post-treatment stages.', zhName: '1000LPH反渗透水处理系统', zhDesc: '完整的反渗透水净化系统，1000升/小时产能。包含预处理、膜过滤和后处理阶段。', params: [{ key_en: 'Production Rate', key_zh: '产能', value: '1000 LPH' }, { key_en: 'Power', key_zh: '功率', value: '5kW' }, { key_en: 'Voltage', key_zh: '电压', value: '220V/380V' }, { key_en: 'Warranty', key_zh: '保修', value: '1 Year' }], inds: ['Food & Beverage', 'Hospital', 'Hotel', 'Farm'] },
    { cat: roSystem.id, slug: '6000lph-ro-plant', enName: '6000LPH RO Water Treatment Plant with PLC Control', enDesc: 'Large-scale RO water treatment plant with PLC automatic control. Ideal for industrial and municipal water supply projects.', zhName: '6000LPH PLC控制RO水处理厂', zhDesc: '大型RO水处理厂，配备PLC自动控制。适用于工业和市政供水项目。', params: [{ key_en: 'Production Rate', key_zh: '产能', value: '6000 LPH' }, { key_en: 'Control', key_zh: '控制', value: 'PLC Automatic' }, { key_en: 'Power', key_zh: '功率', value: '20kW' }, { key_en: 'Weight', key_zh: '重量', value: '3000kg' }], inds: ['Industrial', 'Municipal', 'Agriculture'] },
    { cat: filtration.id, slug: 'uf-8060-membrane', enName: 'UF 8060 Ultra Filtration Membrane', enDesc: 'High-performance ultrafiltration membrane for water purification and wastewater treatment. Reliable and long-lasting.', zhName: '超滤膜UF 8060', zhDesc: '高性能超滤膜，用于水净化和废水处理。可靠耐用。', params: [{ key_en: 'Model', key_zh: '型号', value: 'UF 8060' }, { key_en: 'Size', key_zh: '尺寸', value: '8 inch' }, { key_en: 'Material', key_zh: '材质', value: 'PVDF' }], inds: ['Water Treatment', 'Industrial', 'Municipal'] },
    { cat: filtration.id, slug: '10000l-stainless-storage-tank', enName: '10000L Stainless Steel Storage Tank', enDesc: 'Large capacity stainless steel storage tank for water and liquid storage. Factory direct price with fast delivery.', zhName: '10000L不锈钢储罐', zhDesc: '大容量不锈钢储罐，用于水和液体储存。厂家直销，快速交付。', params: [{ key_en: 'Material', key_zh: '材质', value: 'SS304' }, { key_en: 'Capacity', key_zh: '容量', value: '10000L' }, { key_en: 'Weight', key_zh: '重量', value: '850kg' }], inds: ['Water Treatment', 'Chemical', 'Agricultural'] },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        categoryId: p.cat,
        slug: p.slug,
        translations: JSON.stringify({ en: { name: p.enName, description: p.enDesc }, zh: { name: p.zhName, description: p.zhDesc } }),
        parameters: JSON.stringify(p.params),
        industries: JSON.stringify(p.inds),
        images: JSON.stringify([]),
        isPublished: true,
      },
    });
  }
  console.log('✅ 6 products created');

  // --- Cases ---
  const cases = [
    { slug: 'kenya-rural-water-supply', enName: 'Kenya Rural Water Supply Project', enDesc: 'Deployed 5 RO systems for rural communities in Kenya, providing clean drinking water to over 50,000 residents.', enContent: 'STARK provided a complete water treatment solution for multiple rural communities in Kenya. The project included 5 reverse osmosis systems with a combined capacity of 5000 LPH, serving over 50,000 residents with clean, safe drinking water. The systems were designed for low-maintenance operation in remote areas with limited infrastructure.', zhName: '肯尼亚农村供水项目', zhDesc: '为肯尼亚农村社区部署5套RO系统，为50000+居民提供清洁饮用水。', zhContent: 'STARK为肯尼亚多个农村社区提供了完整的水处理解决方案。项目包含5套反渗透系统，总产能5000LPH，为超过50000名居民提供清洁安全的饮用水。系统专为基础设施有限的偏远地区低维护运行而设计。' },
    { slug: 'saudi-arabia-industrial-ro', enName: 'Saudi Arabia Industrial RO Plant', enDesc: '6000LPH RO plant for a major food processing factory in Riyadh. PLC-controlled fully automatic operation.', enContent: 'We installed a 6000LPH RO water treatment plant at a major food processing facility in Riyadh, Saudi Arabia. The PLC-controlled system ensures consistent water quality with minimal operator intervention. The project was completed within 45 days and has been running reliably for over 2 years.', zhName: '沙特阿拉伯工业RO厂', zhDesc: '为利雅得大型食品加工厂提供6000LPH RO设备。PLC全自动控制。', zhContent: '我们在沙特阿拉伯利雅得一家大型食品加工厂安装了6000LPH的RO水处理设备。PLC控制的系统确保水质稳定，操作人员干预最少。项目在45天内完成，已可靠运行超过2年。' },
    { slug: 'vietnam-hotel-water-system', enName: 'Vietnam Resort Hotel Water Treatment', enDesc: 'Complete water treatment solution for a 5-star resort in Da Nang, including filtration, softening, and RO.', enContent: 'STARK designed and installed a comprehensive water treatment system for a luxury beach resort in Da Nang, Vietnam. The solution includes multimedia filtration, water softening, and reverse osmosis to meet the high water quality standards required by the hospitality industry.', zhName: '越南度假酒店水处理', zhDesc: '为岘港五星级度假村提供完整水处理方案，含过滤、软化和RO。', zhContent: 'STARK为越南岘港一家豪华海滩度假村设计并安装了全面的水处理系统。方案包括多介质过滤、软化和反渗透，满足酒店业对高品质用水的要求。' },
  ];

  for (const c of cases) {
    await prisma.case.create({
      data: {
        slug: c.slug,
        translations: JSON.stringify({ en: { name: c.enName, description: c.enDesc, content: c.enContent }, zh: { name: c.zhName, description: c.zhDesc, content: c.zhContent } }),
        images: JSON.stringify([]),
        isPublished: true,
      },
    });
  }
  console.log('✅ 3 cases created');

  // --- News Categories ---
  const companyNews = await prisma.newsCategory.create({
    data: { name: 'Company News', slug: 'company-news', translations: JSON.stringify({ en: 'Company News', zh: '公司新闻' }) },
  });
  const industry = await prisma.newsCategory.create({
    data: { name: 'Industry Insights', slug: 'industry-insights', translations: JSON.stringify({ en: 'Industry Insights', zh: '行业洞察' }) },
  });

  // --- News ---
  const newsItems = [
    { cat: companyNews.id, slug: 'stark-2024-exhibition', enTitle: 'STARK at Water Expo 2024 in Dubai', enSummary: 'STARK showcased latest stainless steel water treatment solutions at the Dubai Water Expo 2024.', enContent: 'STARK Environmental Solutions participated in the Water Expo 2024 in Dubai, showcasing our latest range of stainless steel water tanks, RO systems, and filtration equipment. The exhibition attracted visitors from over 50 countries, and we established valuable connections with distributors and end-users worldwide.' },
    { cat: companyNews.id, slug: 'new-factory-expansion', enTitle: 'STARK Announces Factory Expansion in Dongguan', enSummary: 'New production line added to meet growing international demand for water treatment equipment.', enContent: 'To meet the increasing demand from international markets, STARK has expanded its manufacturing facility in Dongguan. The new production line increases our annual capacity by 40%, enabling faster delivery times and larger project capabilities.' },
    { cat: industry.id, slug: 'water-treatment-trends-2024', enTitle: 'Top 5 Water Treatment Industry Trends in 2024', enSummary: 'From smart monitoring to sustainable materials — key trends shaping the water treatment industry.', enContent: 'The water treatment industry is evolving rapidly. Key trends include IoT-enabled monitoring systems, membrane technology advances, zero liquid discharge (ZLD) solutions, and increasing demand for stainless steel over plastic tanks due to sustainability concerns.' },
  ];

  for (const n of newsItems) {
    await prisma.news.create({
      data: {
        categoryId: n.cat,
        slug: n.slug,
        translations: JSON.stringify({ en: { title: n.enTitle, summary: n.enSummary, content: n.enContent } }),
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log('✅ 3 news articles created');

  // --- FAQs ---
  const faqs = [
    { enQ: 'What materials are your water tanks made of?', enA: 'Our water tanks are made of high-quality SS304 or SS316 stainless steel, ensuring excellent corrosion resistance and durability. We can also provide customized materials based on customer requirements.', zhQ: '你们的水箱用什么材料制造？', zhA: '我们的水箱采用高品质SS304或SS316不锈钢制造，确保优良的耐腐蚀性和耐用性。我们也可根据客户要求提供定制材料。' },
    { enQ: 'What is the minimum order quantity?', enA: 'We are flexible with order quantities. While we are a factory with strong production capacity, we can accommodate both small trial orders and large-scale projects.', zhQ: '最小起订量是多少？', zhA: '我们对订单数量灵活处理。虽然我们是有强大生产能力的工厂，但可接受小批量试单和大规模项目。' },
    { enQ: 'How long is the delivery time?', enA: 'Standard products can be delivered within 15-30 days. Custom products may take 30-45 days depending on specifications. We also offer express shipping options for urgent orders.', zhQ: '交货时间多长？', zhA: '标准产品可在15-30天内交付。定制产品根据规格可能需要30-45天。我们也为紧急订单提供快速运输选项。' },
    { enQ: 'Do you provide installation and after-sales service?', enA: 'Yes, we provide comprehensive after-sales support including installation guidance, online technical support, and a 1-year warranty on all our products.', zhQ: '你们提供安装和售后服务吗？', zhA: '是的，我们提供全面的售后支持，包括安装指导、在线技术支持和所有产品的1年保修。' },
    { enQ: 'Can I get a sample before bulk order?', enA: 'Yes, sample orders are welcome. Please contact our sales team to discuss your requirements and we will arrange sample delivery.', zhQ: '批量下单前可以获取样品吗？', zhA: '可以，欢迎样品订单。请联系我们的销售团队讨论您的需求，我们将安排样品交付。' },
  ];

  for (const f of faqs) {
    await prisma.faq.create({
      data: {
        translations: JSON.stringify({ en: { question: f.enQ, answer: f.enA }, zh: { question: f.zhQ, answer: f.zhA } }),
        isPublished: true,
        sortOrder: 0,
      },
    });
  }
  console.log('✅ 5 FAQs created');

  console.log('🌱 Mock data seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
