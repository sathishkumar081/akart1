import { getCurrentUser } from 'auth';

export const render = async () => {
    const store = await import('store');
    const user = getCurrentUser();
    const totalEarnings = store.getEarnings(user.id);
    const w2cRecords = store.getWasteToCompanyRecords(user.id);
    const w2cEarnings = w2cRecords.reduce((sum, record) => sum + record.buyback, 0);
    const salesEarnings = totalEarnings - w2cEarnings;

    // Mock monthly data for charts
    const monthlyData = [
        { month: 'Jan', sales: 2500, w2c: 500 },
        { month: 'Feb', sales: 3200, w2c: 300 },
        { month: 'Mar', sales: 2800, w2c: 700 },
        { month: 'Apr', sales: 3500, w2c: 200 },
        { month: 'May', sales: 4100, w2c: 600 },
        { month: 'Jun', sales: 3800, w2c: 400 }
    ];

    const chartBars = monthlyData.map(data => {
        const totalHeight = data.sales + data.w2c;
        const maxHeight = Math.max(...monthlyData.map(d => d.sales + d.w2c));
        const heightPercent = (totalHeight / maxHeight) * 100;
        const salesPercent = (data.sales / totalHeight) * 100;
        
        return `
            <div style="display: flex; flex-direction: column; align-items: center; height: 200px;">
                <div style="flex: 1; display: flex; flex-direction: column-reverse; width: 40px; position: relative;">
                    <div style="width: 100%; height: ${heightPercent}%; background: linear-gradient(to top, #2a9d8f ${salesPercent}%, #e76f51 ${salesPercent}%); border-radius: 4px 4px 0 0; position: relative;">
                        <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: #374151; font-weight: bold;">₹${(totalHeight/1000).toFixed(1)}k</span>
                    </div>
                </div>
                <span style="margin-top: 0.5rem; font-size: 0.8rem; color: #4B5563;">${data.month}</span>
            </div>
        `;
    }).join('');

    return `
        <main>
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Earnings Summary</h1>
            </div>
            
            <div class="earnings-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-coins" style="font-size: 3rem; color: #2a9d8f; margin-bottom: 1rem;"></i>
                    <h3 style="color: #2a9d8f; margin: 0 0 0.5rem 0;">Total Lifetime Earnings</h3>
                    <p style="font-size: 2.5rem; font-weight: bold; color: #2a9d8f; margin: 0;">₹${totalEarnings.toLocaleString()}</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #3742fa; margin-bottom: 1rem;"></i>
                    <h3 style="color: #3742fa; margin: 0 0 0.5rem 0;">Customer Sales</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: #3742fa; margin: 0;">₹${salesEarnings.toLocaleString()}</p>
                    <p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0 0 0;">${((salesEarnings/totalEarnings)*100).toFixed(1)}% of total</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-recycle" style="font-size: 3rem; color: #e76f51; margin-bottom: 1rem;"></i>
                    <h3 style="color: #e76f51; margin: 0 0 0.5rem 0;">Waste to Company</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: #e76f51; margin: 0;">₹${w2cEarnings.toLocaleString()}</p>
                    <p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0 0 0;">${((w2cEarnings/totalEarnings)*100).toFixed(1)}% of total</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-clock" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                    <h3 style="color: #f39c12; margin: 0 0 0.5rem 0;">Pending Payments</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: #f39c12; margin: 0;">₹0</p>
                    <p style="font-size: 0.9rem; color: #666; margin: 0.5rem 0 0 0;">All payments cleared</p>
                </div>
            </div>
            
            <div class="charts-section" style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                <h3 style="color: #333; margin: 0 0 2rem 0;"><i class="fas fa-chart-bar"></i> Monthly Earnings Breakdown</h3>
                <div style="display: flex; justify-content: space-around; align-items: end; height: 250px; background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                    ${chartBars}
                </div>
                <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: #2a9d8f; border-radius: 2px;"></div>
                        <span style="font-size: 0.9rem; color: #666;">Customer Sales</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: #e76f51; border-radius: 2px;"></div>
                        <span style="font-size: 0.9rem; color: #666;">Waste to Company</span>
                    </div>
                </div>
            </div>
            
            <div class="recent-transactions" style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin: 0 0 1.5rem 0;"><i class="fas fa-history"></i> Recent Waste to Company Transactions</h3>
                ${w2cRecords.length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${w2cRecords.slice(-5).reverse().map(record => `
                            <div style="display: flex; justify-content: between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; last-child:border-bottom: none;">
                                <div>
                                    <p style="margin: 0; font-weight: bold; color: #333;">${record.name}</p>
                                    <p style="margin: 0; font-size: 0.9rem; color: #666;">${new Date(record.at).toLocaleDateString()}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0; font-weight: bold; color: #e76f51;">₹${record.buyback}</p>
                                    <p style="margin: 0; font-size: 0.8rem; color: #888;">${record.unit}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-receipt" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                        <p>No Waste to Company transactions yet.</p>
                    </div>
                `}
            </div>
        </main>
    `;
};

export const addEventListeners = () => {
    // Add any interactive functionality here
};
