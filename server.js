/**
 *  * ============================================================================
  * AGRIBHARAT ENTERPRISE BACKEND ECOSYSTEM (Codespaces Version)
   * ============================================================================
    */

    const express = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');

    const app = express();
    const PORT = process.env.PORT || 3000;

    // 1. SECURITY & CORE MIDDLEWARES
    app.use(helmet());
    app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
    app.use(express.json({ limit: '10mb' }));

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
            max: 100,
                message: { success: false, error: "Too many requests, please try again later." }
                });
                app.use('/api/', apiLimiter);

                // 2. DATABASE REPOSITORY MOCK
                const DatabaseRepository = {
                    mandis: [
                            { id: "m1", crop: "Wheat (Sharbati)", state: "Madhya Pradesh", mandi: "Sehore APMC", min: 2420, max: 2780, modal: 2610, trend: "+2.4%", updatedAt: new Date() },
                                    { id: "m2", crop: "Basmati Paddy (1121)", state: "Haryana", mandi: "Karnal APMC", min: 3750, max: 4120, modal: 3920, trend: "+2.1%", updatedAt: new Date() },
                                            { id: "m3", crop: "Onion (Red Nashik)", state: "Maharashtra", mandi: "Lasalgaon APMC", min: 1850, max: 2380, modal: 2150, trend: "+4.2%", updatedAt: new Date() },
                                                    { id: "m4", crop: "Soybean (Yellow)", state: "Madhya Pradesh", mandi: "Indore APMC", min: 4510, max: 4790, modal: 4680, trend: "0.0%", updatedAt: new Date() },
                                                            { id: "m5", crop: "Mustard (Oilseed)", state: "Rajasthan", mandi: "Alwar APMC", min: 5450, max: 5790, modal: 5640, trend: "+1.5%" }
                                                                ],
                                                                    cropsLibrary: {
                                                                            wheat: { name: "Wheat", NPK: { N: 120, P: 60, K: 40 }, seedRateHa: 100 },
                                                                                    rice: { name: "Paddy / Rice", NPK: { N: 100, P: 50, K: 50 }, seedRateHa: 40 },
                                                                                            cotton: { name: "Cotton", NPK: { N: 150, P: 60, K: 60 }, seedRateHa: 2.5 }
                                                                                                }
                                                                                                };

                                                                                                // 3. API ENDPOINTS
                                                                                                app.get('/api/v1/health', (req, res) => {
                                                                                                    res.status(200).json({ success: true, status: "Operational", environment: "GitHub Codespaces Cloud", timestamp: new Date().toISOString() });
                                                                                                    });

                                                                                                    app.get('/api/v1/mandis', (req, res) => {
                                                                                                        const { state, crop } = req.query;
                                                                                                            let results = DatabaseRepository.mandis;
                                                                                                                if (state && state.toUpperCase() !== 'ALL') {
                                                                                                                        results = results.filter(item => item.state.toLowerCase() === state.toLowerCase());
                                                                                                                            }
                                                                                                                                if (crop) {
                                                                                                                                        results = results.filter(item => item.crop.toLowerCase().includes(crop.toLowerCase()));
                                                                                                                                            }
                                                                                                                                                res.status(200).json({ success: true, count: results.length, data: results });
                                                                                                                                                });

                                                                                                                                                app.post('/api/v1/calculate-npk', (req, res) => {
                                                                                                                                                    try {
                                                                                                                                                            const { crop, area, unit } = req.body;
                                                                                                                                                                    if (!crop || !area || !unit) {
                                                                                                                                                                                return res.status(400).json({ success: false, error: "Missing required fields: crop, area, unit." });
                                                                                                                                                                                        }
                                                                                                                                                                                                const cropData = DatabaseRepository.cropsLibrary[crop.toLowerCase()] || DatabaseRepository.cropsLibrary.wheat;
                                                                                                                                                                                                        const numericArea = parseFloat(area);
                                                                                                                                                                                                                const areaInHectares = (unit.toLowerCase() === 'acre') ? (numericArea * 0.404686) : numericArea;

                                                                                                                                                                                                                        const reqN = cropData.NPK.N * areaInHectares;
                                                                                                                                                                                                                                const reqP = cropData.NPK.P * areaInHectares;
                                                                                                                                                                                                                                        const reqK = cropData.NPK.K * areaInHectares;

                                                                                                                                                                                                                                                const dapKg = reqP / 0.46;
                                                                                                                                                                                                                                                        const nFromDap = dapKg * 0.18;
                                                                                                                                                                                                                                                                const remainingN = Math.max(0, reqN - nFromDap);
                                                                                                                                                                                                                                                                        const ureaKg = remainingN / 0.46;
                                                                                                                                                                                                                                                                                const mopKg = reqK / 0.60;
                                                                                                                                                                                                                                                                                        const seedKg = cropData.seedRateHa * areaInHectares;

                                                                                                                                                                                                                                                                                                res.status(200).json({
                                                                                                                                                                                                                                                                                                            success: true,
                                                                                                                                                                                                                                                                                                                        calculation_standard: "ICAR Agronomy Guidelines",
                                                                                                                                                                                                                                                                                                                                    recommendation: {
                                                                                                                                                                                                                                                                                                                                                    urea: { total_kg: parseFloat(ureaKg.toFixed(1)), bags_45kg: parseFloat((ureaKg / 45).toFixed(2)) },
                                                                                                                                                                                                                                                                                                                                                                    dap: { total_kg: parseFloat(dapKg.toFixed(1)), bags_50kg: parseFloat((dapKg / 50).toFixed(2)) },
                                                                                                                                                                                                                                                                                                                                                                                    mop: { total_kg: parseFloat(mopKg.toFixed(1)), bags_50kg: parseFloat((mopKg / 50).toFixed(2)) },
                                                                                                                                                                                                                                                                                                                                                                                                    certified_seed: { total_kg: parseFloat(seedKg.toFixed(1)) }
                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                                                                                                                                                                                    res.status(500).json({ success: false, error: "Calculation error." });
                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                                        // 4. SERVER RUN
                                                                                                                                                                                                                                                                                                                                                                                                                                        app.listen(PORT, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                            console.log(`🚀 AgriBharat Backend live on port ${PORT}`);
                                                                                                                                                                                                                                                                                                                                                                                                                                            });


