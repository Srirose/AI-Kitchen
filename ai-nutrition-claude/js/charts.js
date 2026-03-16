/**
 * SVG Chart Generation Module
 * Creates ring charts and bar charts for nutrition visualization
 */

/**
 * Create SVG ring chart (donut chart)
 * @param {Object} data - Nutrient data
 * @param {Object} targets - Target values
 * @param {number} size - Chart size in pixels
 * @returns {string} - SVG HTML string
 */
export function createRingChart(data, targets, size = 200) {
  const nutrients = [
    { key: 'calories', label: 'Calories', color: '#10b981' },
    { key: 'protein', label: 'Protein', color: '#3b82f6' },
    { key: 'carbs', label: 'Carbs', color: '#f59e0b' },
    { key: 'fat', label: 'Fat', color: '#ef4444' },
    { key: 'fiber', label: 'Fiber', color: '#8b5cf6' }
  ];
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 20;
  const strokeWidth = 12;
  
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="ring-chart">`;
  
  nutrients.forEach((nutrient, index) => {
    const current = data[nutrient.key] || 0;
    const target = targets[nutrient.key] || 1;
    const percentage = Math.min((current / target) * 100, 100);
    
    const angle = (percentage / 100) * 360;
    const startAngle = -90 + (index * 72); // 72 degrees per ring (360/5)
    const endAngle = startAngle + angle;
    
    // Background ring
    svg += createArc(centerX, centerY, radius - (index * 16), startAngle, startAngle + 360, '#e5e7eb', strokeWidth);
    
    // Progress ring
    if (percentage > 0) {
      svg += createArc(centerX, centerY, radius - (index * 16), startAngle, endAngle, nutrient.color, strokeWidth);
    }
    
    // Label
    const labelAngle = (startAngle + 36) * (Math.PI / 180);
    const labelRadius = radius + 15;
    const labelX = centerX + Math.cos(labelAngle) * labelRadius;
    const labelY = centerY + Math.sin(labelAngle) * labelRadius;
    
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="10" fill="#6b7280">${nutrient.label}</text>`;
  });
  
  // Center text
  svg += `<text x="${centerX}" y="${centerY - 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1f2937">${Math.round((data.calories / targets.calories) * 100)}%</text>`;
  svg += `<text x="${centerX}" y="${centerY + 12}" text-anchor="middle" font-size="10" fill="#6b7280">of daily</text>`;
  
  svg += '</svg>';
  return svg;
}

/**
 * Create arc path for SVG
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} r - Radius
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @param {string} color - Stroke color
 * @param {number} strokeWidth - Stroke width
 * @returns {string} - SVG path element
 */
function createArc(cx, cy, r, startAngle, endAngle, color, strokeWidth) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  const d = [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
  
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
}

/**
 * Convert polar coordinates to cartesian
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} r - Radius
 * @param {number} angle - Angle in degrees
 * @returns {Object} - x, y coordinates
 */
function polarToCartesian(cx, cy, r, angle) {
  const angleInRadians = (angle - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians)
  };
}

/**
 * Create horizontal bar chart
 * @param {Object} data - Nutrient data
 * @param {Object} targets - Target values
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @returns {string} - SVG HTML string
 */
export function createBarChart(data, targets, width = 400, height = 250) {
  const nutrients = [
    { key: 'calories', label: 'Calories', color: '#10b981', unit: '' },
    { key: 'protein', label: 'Protein', color: '#3b82f6', unit: 'g' },
    { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
    { key: 'fat', label: 'Fat', color: '#ef4444', unit: 'g' },
    { key: 'fiber', label: 'Fiber', color: '#8b5cf6', unit: 'g' }
  ];
  
  const barHeight = 30;
  const barGap = 20;
  const leftMargin = 80;
  const rightMargin = 60;
  const topMargin = 20;
  const chartWidth = width - leftMargin - rightMargin;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="bar-chart">`;
  
  // Title
  svg += `<text x="${width / 2}" y="15" text-anchor="middle" font-size="14" font-weight="600" fill="#1f2937">Daily Nutrition vs Targets</text>`;
  
  nutrients.forEach((nutrient, index) => {
    const y = topMargin + 20 + (index * (barHeight + barGap));
    const current = data[nutrient.key] || 0;
    const target = targets[nutrient.key] || 1;
    const percentage = Math.min((current / target), 1);
    const barWidth = percentage * chartWidth;
    
    // Label
    svg += `<text x="${leftMargin - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="12" fill="#4b5563">${nutrient.label}</text>`;
    
    // Background bar
    svg += `<rect x="${leftMargin}" y="${y}" width="${chartWidth}" height="${barHeight}" rx="4" fill="#e5e7eb" />`;
    
    // Progress bar
    if (barWidth > 0) {
      svg += `<rect x="${leftMargin}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${nutrient.color}" />`;
    }
    
    // Value text
    svg += `<text x="${leftMargin + chartWidth + 10}" y="${y + barHeight / 2 + 4}" font-size="11" fill="#6b7280">${Math.round(current)}/${Math.round(target)}${nutrient.unit}</text>`;
    
    // Percentage on bar
    if (barWidth > 40) {
      svg += `<text x="${leftMargin + barWidth - 5}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="10" fill="white" font-weight="500">${Math.round(percentage * 100)}%</text>`;
    }
  });
  
  svg += '</svg>';
  return svg;
}

/**
 * Create sustainability score gauge
 * @param {number} score - Score 0-10
 * @param {number} size - Gauge size
 * @returns {string} - SVG HTML string
 */
export function createSustainabilityGauge(score, size = 150) {
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  const radius = (size / 2) - 25;
  
  // Determine color based on score
  let color;
  if (score >= 8) color = '#10b981';
  else if (score >= 6) color = '#3b82f6';
  else if (score >= 4) color = '#f59e0b';
  else color = '#ef4444';
  
  const angle = (score / 10) * 180 - 180;
  
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="sustainability-gauge">`;
  
  // Background arc
  svg += createArc(centerX, centerY, radius, -180, 0, '#e5e7eb', 20);
  
  // Progress arc
  svg += createArc(centerX, centerY, radius, -180, angle, color, 20);
  
  // Score text
  svg += `<text x="${centerX}" y="${centerY + 10}" text-anchor="middle" font-size="32" font-weight="bold" fill="#1f2937">${score}</text>`;
  svg += `<text x="${centerX}" y="${centerY + 30}" text-anchor="middle" font-size="10" fill="#6b7280">/ 10</text>`;
  
  // Label
  svg += `<text x="${centerX}" y="${size - 10}" text-anchor="middle" font-size="12" fill="#4b5563">Eco Score</text>`;
  
  svg += '</svg>';
  return svg;
}

/**
 * Create weekly calorie history chart
 * @param {Array} data - Array of daily calorie data
 * @param {number} target - Daily calorie target
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @returns {string} - SVG HTML string
 */
export function createWeeklyChart(data, target, width = 500, height = 200) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxValue = Math.max(...data.map(d => d.calories), target * 1.2);
  const barWidth = chartWidth / 7 - 10;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="weekly-chart">`;
  
  // Title
  svg += `<text x="${width / 2}" y="20" text-anchor="middle" font-size="14" font-weight="600" fill="#1f2937">Weekly Calorie Intake</text>`;
  
  // Target line
  const targetY = padding.top + chartHeight - (target / maxValue) * chartHeight;
  svg += `<line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5" />`;
  svg += `<text x="${width - padding.right + 5}" y="${targetY + 4}" font-size="10" fill="#10b981">Target</text>`;
  
  // Bars
  data.forEach((day, index) => {
    const x = padding.left + (index * (chartWidth / 7)) + 5;
    const barHeight = (day.calories / maxValue) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    
    const color = day.calories > target ? '#ef4444' : '#3b82f6';
    
    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" opacity="0.8" />`;
    
    // Day label
    svg += `<text x="${x + barWidth / 2}" y="${height - 15}" text-anchor="middle" font-size="11" fill="#4b5563">${days[index]}</text>`;
    
    // Value label
    if (barHeight > 20) {
      svg += `<text x="${x + barWidth / 2}" y="${y + 15}" text-anchor="middle" font-size="10" fill="white" font-weight="500">${day.calories}</text>`;
    }
  });
  
  // Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const value = Math.round((maxValue / 4) * i);
    const y = padding.top + chartHeight - ((value / maxValue) * chartHeight);
    svg += `<text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${value}</text>`;
  }
  
  svg += '</svg>';
  return svg;
}
