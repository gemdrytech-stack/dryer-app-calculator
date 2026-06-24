import React, { useMemo, useState } from "react";
import {
  Activity,
  Calculator,
  CheckCircle2,
  //Download,
  Droplets,
  FileText,
  //Flame,
  Fuel,
  Layers,
  RefreshCcw,
  Sheet,
  Wind,
  ThermometerSun
} from "lucide-react";
import "./App.css";
import logo from "./Assets/logo192.png";

const defaultInputs = {
  dryingLengthFactor: 3.251,
  dryingLengthQuantity: 1,
  width: 2.6,
  productThickness: 0.20,
  layer: 1,
  wetProductDensity: 500,
  dryingTime: 20,
  feedMaterial: 0,
  feedMoisture: 0,
  dischargeMoisture: 0,
  specificHeatMaterial: 0.4,
  materialInletTemp: 20,
  materialOutletTemp: 60,
  heatLossFactor: 0.2,
  airDensity: 0.7451,
  initialAirTemp: 30,
  dryAirTemp: 130,
  exhaustTemp: 70,
  specificHeatAir: 0.254,
  requiredHeat: 37000,
  heatTransferCoefficient: 25.7,
  heatEfficiency: 0.8,
  finsTemp: 85,
  ambientTemp: 5,
};

const dryingLengthOptions = [3.251, 2.184];

const defaultFixedItems = [
  { id: 1, item: "Sensible Heat Factor", fixedValue: 75, quantity: 1823.7, unit: "kcal/hr" },
  { id: 2, item: "Latent Heat Factor", fixedValue: 540, quantity: 1823.7, unit: "kcal/hr" },
  { id: 3, item: "Custom Fixed Item", fixedValue: 0, quantity: 1, unit: "" },
];

const fuelDefaults = [
  { name: "PNG", basis: "Kcal / Kg", gcv: 9000, unit: "kg/hr" },
  { name: "PNG", basis: "Kcal / m³", gcv: 9500, unit: "m³/hr" },
  { name: "CNG", basis: "Kcal / Kg", gcv: 1500, unit: "kg/hr" },
  { name: "LPG / Diesel", basis: "Kcal / Kg", gcv: 10800, unit: "kg/hr" },
  { name: "Steam", basis: "Kcal / Kg", gcv: 630, unit: "kg/hr" },
  { name: "Electric", basis: "Kcal / kW", gcv: 860, unit: "kW" },
];

const safeDiv = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? a / b : 0);
const n = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const fmt = (value, digits = 2) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
    : "0";

const tableInputStyle = {
  width: "100%",
  minWidth: "95px",
  border: "1px solid #d4d4d8",
  borderRadius: "8px",
  padding: "8px 10px",
  fontWeight: 600,
  background: "#fff",
};

function Pill({ children, type = "input" }) {
  return <span className={`pill pill-${type}`}>{children}</span>;
}

function KpiCard({ icon: Icon, title, value, unit, tone = "black", note }) {
  return (
    <div className="kpi-card">
      <div className="kpi-inner">
        <div className={`kpi-icon kpi-icon-${tone}`}>
          <Icon size={21} />
        </div>
        <div>
          <div className="kpi-title">{title}</div>
          <div className="kpi-value-row">
            <span className="kpi-value">{value}</span>
            {unit && <span className="unit">{unit}</span>}
          </div>
          {note && <div className="kpi-note">{note}</div>}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, unit }) {
  return (
    <label className="field input-field">
      <div className="field-head">
        <span>{label}</span>
        <Pill>Input</Pill>
      </div>
      <div className="field-body">
        <input type="number" value={value} onChange={(event) => onChange(n(event.target.value))} />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
    </label>
  );
}

function SelectCalcField({ label, value, onChange, options, calculatedValue, unit, formula, digits = 3 }) {
  return (
    <label className="field input-field calc-field">
      <div className="field-head">
        <span>{label}</span>
        <div>
          <Pill>Input</Pill>{" "}
          <Pill type="calc">Calc</Pill>
        </div>
      </div>

      <div className="dflex">

        <div className="calc-value-row" style={{ width: "70%" }}>
          <span className="calc-value">{fmt(calculatedValue, digits)}</span>
          {unit && <span className="field-unit">{unit}</span>}
        </div>

        <div className="field-body">
          <select value={value} onChange={(event) => onChange(n(event.target.value))}>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {unit && <span className="field-unit">{unit}</span>}
        </div>

      </div>

      {formula && <div className="formula">{formula}</div>}
    </label>
  );
}

function CalcField({ label, value, unit, formula, digits = 2 }) {
  return (
    <div className="field calc-field">
      <div className="field-head">
        <span>{label}</span>
        <Pill type="calc">Calc</Pill>
      </div>
      <div className="calc-value-row">
        <span className="calc-value">{fmt(value, digits)}</span>
        {unit && <span className="field-unit">{unit}</span>}
      </div>
      {formula && <div className="formula">{formula}</div>}
    </div>
  );
}

function Section({ id, icon: Icon, title, subtitle, children, action }) {
  return (
    <section id={id} className="section-card">
      <div className="section-title-row">
        <div className="section-icon">
          <Icon size={18} />
        </div>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {action && <div className="section-action">{action}</div>}
      </div>

      {children}
    </section>
  );
}

export default function App() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [fixedItems, setFixedItems] = useState(defaultFixedItems);
  const [manualHeatBalance, setManualHeatBalance] = useState(false);
  const [heatBalanceInput, setHeatBalanceInput] = useState(0);

  const update = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

  // const updateFixedItem = (id, key, value) => {
  //   setFixedItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  // };

  // const addFixedItem = () => {
  //   setFixedItems((prev) => [
  //     ...prev,
  //     { id: Date.now(), item: "New Fixed Item", fixedValue: 0, quantity: 1, unit: "" },
  //   ]);
  // };

  // const removeFixedItem = (id) => {
  //   setFixedItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  // };

  const calc = useMemo(() => {
    const dryingLength = inputs.dryingLengthFactor * inputs.dryingLengthQuantity;
    const volume = dryingLength * inputs.width * inputs.productThickness * inputs.layer;
    const totalKgPerBed = inputs.wetProductDensity * volume;
    const wetFeed = safeDiv(totalKgPerBed, 0.016666666665 * inputs.dryingTime);

    const solidKg = ((100 - inputs.feedMoisture) / 100) * inputs.feedMaterial;
    const materialDischarge = safeDiv(solidKg, 100 - inputs.dischargeMoisture) * 100;
    const waterEvaporation = inputs.feedMaterial - materialDischarge;

    const sensibleHeatWater = 75 * waterEvaporation;
    const materialHeating = materialDischarge * inputs.specificHeatMaterial * (inputs.materialOutletTemp - inputs.materialInletTemp);
    const latentHeat = waterEvaporation * 540;
    const heatLoss = inputs.heatLossFactor * (sensibleHeatWater + materialHeating + latentHeat);
    const totalHeatLoad = sensibleHeatWater + materialHeating + latentHeat + heatLoss;

    const exhaustDeltaT = inputs.dryAirTemp - inputs.exhaustTemp;
    const airVolume = safeDiv(totalHeatLoad, inputs.specificHeatAir * exhaustDeltaT * inputs.airDensity);
    const airMass = airVolume * inputs.airDensity;
    const risingDeltaT = inputs.dryAirTemp - inputs.initialAirTemp;
    const risingHeatLoad = airMass * risingDeltaT * inputs.specificHeatAir;
    const exhaustHeatLoad = airMass * exhaustDeltaT * inputs.specificHeatAir;
    const totalAirHeatLoad = risingHeatLoad + exhaustHeatLoad;
    const calculatedHeatBalance = safeDiv(exhaustHeatLoad, totalHeatLoad);
    const heatBalance = manualHeatBalance ? heatBalanceInput : calculatedHeatBalance;
    const steamForAirHeating = safeDiv(risingHeatLoad, 630);

    const finsDeltaT = inputs.finsTemp - inputs.ambientTemp;
    const requiredSurfaceArea = safeDiv(inputs.requiredHeat, inputs.heatTransferCoefficient * inputs.heatEfficiency * finsDeltaT);


    const fuelRows = fuelDefaults.map((fuel) => {
      const consumption = safeDiv(totalHeatLoad, fuel.gcv);
      return {
        ...fuel,
        consumption,
        directHeat: consumption * 1.25,
        indirectHeat: consumption * 1.6,
      };
    });

    return {
      dryingLength,
      volume,
      totalKgPerBed,
      wetFeed,
      solidKg,
      materialDischarge,
      waterEvaporation,
      sensibleHeatWater,
      materialHeating,
      latentHeat,
      heatLoss,
      totalHeatLoad,
      airVolume,
      airMass,
      risingDeltaT,
      exhaustDeltaT,
      risingHeatLoad,
      exhaustHeatLoad,
      totalAirHeatLoad,
      heatBalance,
      steamForAirHeating,
      finsDeltaT,
      requiredSurfaceArea,
      fuelRows,
      calculatedHeatBalance
    };
  }, [inputs, manualHeatBalance, heatBalanceInput]);

  const fixedSummary = useMemo(() => {
    const rows = fixedItems.map((item) => ({
      ...item,
      result: n(item.fixedValue) * n(item.quantity),
    }));
    const grandTotal = rows.reduce((sum, row) => sum + row.result, 0);
    return { rows, grandTotal };
  }, [fixedItems]);

  const exportCsv = () => {
    const rows = [
      ["Biomass Band Dryer - Steam Calculation"],
      ["Parameter", "Value", "Unit"],
      ["Water Evaporation", calc.waterEvaporation.toFixed(3), "kg/hr"],
      ["Total Heat Load", calc.totalHeatLoad.toFixed(3), "kcal/hr"],
      ["Air Volume Required", calc.airVolume.toFixed(3), "CMH"],
      ["Heat Balance", calc.heatBalance.toFixed(3), ""],
      [],
      ["Fixed Value x Quantity", "Fixed Value", "Quantity", "Result / Return", "Unit"],
      ...fixedSummary.rows.map((row) => [
        row.item,
        Number(row.fixedValue).toFixed(3),
        Number(row.quantity).toFixed(3),
        row.result.toFixed(3),
        row.unit,
      ]),
      ["Grand Return", "", "", fixedSummary.grandTotal.toFixed(3), ""],
      [],
      ["Fuel", "Consumption / Hour", "Direct Heat", "Indirect Heat", "Unit"],
      ...calc.fuelRows.map((row) => [
        `${row.name} (${row.basis})`,
        row.consumption.toFixed(3),
        row.directHeat.toFixed(3),
        row.indirectHeat.toFixed(3),
        row.unit,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "biomass-band-dryer-steam-calculation.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadInputSectionPdf = () => {
    const section = document.getElementById("input-data-section");

    if (!section) {
      alert("Input Data section not found. Please check the section ID.");
      return;
    }

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Input Data</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .section-card { border: 1px solid #ddd; border-radius: 12px; padding: 20px; }
          .section-action, button { display: none !important; }
          h2 { margin: 0 0 6px; }
          h3 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
          .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .field { border: 1px solid #ddd; border-radius: 10px; padding: 10px; }
          .field-head { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
          input, select { width: 100%; border: none; font-size: 14px; font-weight: 700; }
        </style>
      </head>
      <body>
        ${section.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-row">
            <div className="company-header">
              <img src={logo} alt="Gem Drytech Systems LLP" className="company-logo" />

              <div className="company-title">
                <h1>Dryer Calculator</h1>
                <p>Live calculation workbook</p>
              </div>
            </div>
          </div>
          <div className="action-row">
            <Pill>● Input</Pill>
            <Pill type="calc">● Calculated</Pill>
            <span className="divider" />
            <button className="btn secondary" onClick={() => { setInputs(defaultInputs); setFixedItems(defaultFixedItems); }}><RefreshCcw size={16} />Reset</button>
            <button className="btn secondary" onClick={() => window.print()}><FileText size={16} />PDF</button>
            <button className="btn primary" onClick={exportCsv}><Sheet size={16} />Excel</button>
          </div>
        </div>
      </header>

      <main className="main-wrap">
        <div className="kpi-grid">
          <KpiCard icon={Droplets} title="Water Evaporation" value={fmt(calc.waterEvaporation, 1)} unit="kg/hr" />
          <KpiCard icon={Activity} title="Total Heat Load" value={fmt(calc.totalHeatLoad, 0)} unit="kcal/hr" tone="red" />
          <KpiCard icon={Wind} title="Air Volume Req." value={fmt(calc.airVolume, 0)} unit="CMH" />
          <div className="kpi-card">
            <div className="kpi-inner">
              <div className="kpi-icon kpi-icon-green">
                <CheckCircle2 size={21} />
              </div>

              <div className="heat-balance-container">
                <div className="kpi-title">Heat Balance</div>

                {manualHeatBalance ? (
                  <input
                    type="number"
                    value={heatBalanceInput}
                    onChange={(e) => setHeatBalanceInput(n(e.target.value))}
                    style={{ ...tableInputStyle, maxWidth: "120px" }}
                  />
                ) : (
                  <div className="kpi-value-row">
                    <span className="kpi-value">{fmt(calc.heatBalance, 3)}</span>
                  </div>
                )}

                <div className="kpi-note">
                  <label>
                    <input
                      type="checkbox"
                      checked={manualHeatBalance}
                      onChange={(e) => {
                        setManualHeatBalance(e.target.checked);
                        setHeatBalanceInput(calc.calculatedHeatBalance);
                      }}
                    />{" "}
                    Edit
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Section icon={Layers} title="Dryer Size" subtitle="Row 3 of the workbook: drying length, width, thickness...">
          <div className="form-grid three-col">
            <SelectCalcField
              label="Drying Length"
              value={inputs.dryingLengthFactor}
              onChange={(v) => update("dryingLengthFactor", v)}
              options={dryingLengthOptions}
              calculatedValue={calc.dryingLength}
              unit="m"
              formula="Selected Drying Length × Length Quantity"
              digits={3}
            />
            <InputField label="Length Quantity" value={inputs.dryingLengthQuantity} onChange={(v) => update("dryingLengthQuantity", v)} unit="nos" />
            <InputField label="Width" value={inputs.width} onChange={(v) => update("width", v)} unit="m" />
            <InputField label="Product Thickness" value={inputs.productThickness} onChange={(v) => update("productThickness", v)} unit="m" />
            <InputField label="Layer" value={inputs.layer} onChange={(v) => update("layer", v)} unit="nos" />
            <CalcField label="Volume (m³)" value={calc.volume} unit="m³" formula="Length × Width × Thickness × Layer" digits={3} />
            <InputField label="Bulk Density" value={inputs.wetProductDensity} onChange={(v) => update("wetProductDensity", v)} unit="kg/m³" />
            <CalcField label="Total kg / Bed" value={calc.totalKgPerBed} unit="kg" formula="Wet Product Density × Volume" digits={2} />
            <InputField label="Drying Time" value={inputs.dryingTime} onChange={(v) => update("dryingTime", v)} unit="min" />
            <CalcField label="Wet Feed" value={calc.wetFeed} unit="kg/hr" formula="Total kg / (0.016666666665 × Drying Time)" digits={2} />
          </div>
        </Section>

        <Section icon={Layers} title="Drying Details" subtitle="Mass balance from feed moisture to discharge moisture.">
          <div className="form-grid six-col">
            <InputField label="Feed Material" value={inputs.feedMaterial} onChange={(v) => update("feedMaterial", v)} unit="kg/hr" />
            <InputField label="Feed Moisture" value={inputs.feedMoisture} onChange={(v) => update("feedMoisture", v)} unit="%" />
            <InputField label="Discharge Moisture" value={inputs.dischargeMoisture} onChange={(v) => update("dischargeMoisture", v)} unit="%" />
            <CalcField label="Solid kg" value={calc.solidKg} unit="kg/hr" formula="Feed × (100 - Feed Moisture)%" digits={2} />
            <CalcField label="Material Discharge" value={calc.materialDischarge} unit="kg/hr" formula="Solid kg ÷ (100 - Discharge Moisture) × 100" digits={2} />
            <CalcField label="Water Evaporation" value={calc.waterEvaporation} unit="kg/hr" formula="Feed Material - Material Discharge" digits={2} />
          </div>
        </Section>

        <Section icon={Layers} title="Drying Details workbook" subtitle="Row 3 of the workbook: drying length, width, thickness...">
          <div className="form-grid four-col">
            <CalcField label="MATERIAL FEED" value={inputs.feedMaterial} unit="kg/hr" formula="Feed Material" digits={2} />
            <CalcField label="INPUT MOISTURE" value={inputs.feedMoisture} unit="%" formula="Input Moisture" digits={2} />
            <CalcField label="MATERIAL DISCHARGE" value={calc.materialDischarge} unit="kg/hr" formula="Solid kg ÷ (100 - Discharge Moisture) × 100" digits={2} />
            <CalcField label="OUTPUT MOISTURE" value={inputs.dischargeMoisture} unit="%" formula="Discharge Moisture" digits={2} />
            <CalcField label="WATER EVAPORATION" value={calc.waterEvaporation} unit="kg/hr" formula="Feed Material - Material Discharge" digits={2} />
            <CalcField label="BULK DENSITY" value={inputs.wetProductDensity} unit="kg/m³" formula="Wet Product" digits={2} />
            <CalcField label="DRYING TEMPERATURE" value={inputs.wetProductDensity} unit="kg/m³" formula="Wet Product" digits={2} />
            <CalcField label="DRYING TIME" value={inputs.dryingTime} unit="min" formula="Drying Time" digits={2} />
            <CalcField label="Feeding Thickness" value={inputs.productThickness * 1000} unit="mm" formula="Product Thickness × 1000" digits={0} />
            <CalcField label="Sensible Heat of Water" value={calc.sensibleHeatWater} unit="kcal/hr" formula="75 × Water Evaporation" digits={0} />
            <CalcField label="Material Heating" value={calc.materialHeating} unit="kcal/hr" formula="Discharge × Cp × ΔT" digits={0} />
            <CalcField label="Latent Heat" value={calc.latentHeat} unit="kcal/hr" formula="Water Evaporation × 540" digits={0} />
            <CalcField label="Heat Loss" value={calc.heatLoss} unit="kcal/hr" formula="Loss Factor × subtotal" digits={0} />
            <CalcField label="Total Heat Load" value={calc.totalHeatLoad} unit="kcal/hr" formula="SUM of above" digits={3} />
          </div>
        </Section>

        <div className="one-col-layout">
          {/* <Section icon={Factory} title="Drying Details" subtitle="Mass balance from feed moisture to discharge moisture.">
            <div className="form-grid two-col">
            </div>
          </Section> */}

          <Section icon={ThermometerSun} title="Heat Load Inputs" subtitle="Material heating and heat-loss assumptions.">
            <div className="form-grid five-col">
              <InputField label="Specific Heat of Material" value={inputs.specificHeatMaterial} onChange={(v) => update("specificHeatMaterial", v)} unit="kcal/kg°C" />
              <InputField label="Material Inlet Temp" value={inputs.materialInletTemp} onChange={(v) => update("materialInletTemp", v)} unit="°C" />
              <InputField label="Material Outlet Temp" value={inputs.materialOutletTemp} onChange={(v) => update("materialOutletTemp", v)} unit="°C" />
              <InputField label="Heat Loss" value={inputs.heatLossFactor} onChange={(v) => update("heatLossFactor", v)} unit="factor" />
              <InputField label="Dry Air Temp" value={inputs.dryAirTemp} onChange={(v) => update("dryAirTemp", v)} unit="°C" />
            </div>
          </Section>
        </div>

        <Section icon={Wind} title="Heat Load Calculation for Air Heating" subtitle="Air flow, mass flow, temperature rise and exhaust heat balance.">
          <h3 className="">RISING TEMP</h3>
          <div className="form-grid four-col mb-16">
            <CalcField label="Air Flow" value={calc.airVolume} unit="CMH" formula="Heat Load ÷ (Cp × ΔT × Density)" digits={5} />
            <InputField label="Air Density" value={inputs.airDensity} onChange={(v) => update("airDensity", v)} unit="kg/m³" />
            <CalcField label="MASS" value={calc.airMass} unit="KG/HR" formula="Air Flow × Air Density" digits={5} />
            <InputField label="Initial Temp" value={inputs.initialAirTemp} onChange={(v) => update("initialAirTemp", v)} unit="°C" />
            <InputField label="Dry Air Temp" value={inputs.dryAirTemp} onChange={(v) => update("dryAirTemp", v)} unit="°C" />
            <CalcField label="Delta T" value={calc.risingDeltaT} unit="°C" formula="Initial Temp - Dry Air Temp" digits={0} />
            <InputField label="Specific Heat Air" value={inputs.specificHeatAir} onChange={(v) => update("specificHeatAir", v)} unit="kcal/kg°C" />
          </div>
          <h3 className="">EXHAUST TEMP</h3>
          <div className="form-grid four-col mb-16">
            <CalcField label="Air Flow" value={calc.airVolume} unit="CMH" formula="Heat Load ÷ (Cp × ΔT × Density)" digits={5} />
            <InputField label="Air Density" value={inputs.airDensity} onChange={(v) => update("airDensity", v)} unit="kg/m³" />
            <CalcField label="MASS" value={calc.airMass} unit="KG/HR" formula="Air Flow × Air Density" digits={5} />
            <InputField label="EXHAUST Temp" value={inputs.exhaustTemp} onChange={(v) => update("exhaustTemp", v)} unit="°C" />
            <InputField label="Dry Air Temp" value={inputs.dryAirTemp} onChange={(v) => update("dryAirTemp", v)} unit="°C" />
            <CalcField label="Delta T" value={calc.exhaustDeltaT} unit="°C" formula="Initial Temp - Exhaust Temp" digits={0} />
            <InputField label="Specific Heat Air" value={inputs.specificHeatAir} onChange={(v) => update("specificHeatAir", v)} unit="kcal/kg°C" />
          </div>

          <div className="table-scroll temp-table">
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Air Flow</th>
                  <th>Density</th>
                  <th>Mass</th>
                  <th>Initial / Exhaust</th>
                  <th>Dry Air</th>
                  <th>ΔT</th>
                  <th>Heat Load</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rising Temp</td>
                  <td>{fmt(calc.airVolume, 2)}</td>
                  <td>{fmt(inputs.airDensity, 4)}</td>
                  <td>{fmt(calc.airMass, 2)}</td>
                  <td>{fmt(inputs.initialAirTemp, 0)}</td>
                  <td>{fmt(inputs.dryAirTemp, 0)}</td>
                  <td>{fmt(calc.risingDeltaT, 0)}</td>
                  <td>{fmt(calc.risingHeatLoad, 3)}</td>
                </tr>
                <tr>
                  <td>Exhaust Temp</td>
                  <td>{fmt(calc.airVolume, 2)}</td>
                  <td>{fmt(inputs.airDensity, 4)}</td>
                  <td>{fmt(calc.airMass, 2)}</td>
                  <td>{fmt(inputs.exhaustTemp, 0)}</td>
                  <td>{fmt(inputs.dryAirTemp, 0)}</td>
                  <td>{fmt(calc.exhaustDeltaT, 0)}</td>
                  <td>{fmt(calc.exhaustHeatLoad, 3)}</td>
                </tr>
                <tr className="total-row">
                  <td colSpan="7">Total Air Heating Load</td>
                  <td>{fmt(calc.totalAirHeatLoad, 3)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <div className="">
          <Section icon={Fuel} title="Fuel Consumption" subtitle="Consumption, direct heat and indirect heat from workbook multipliers.">
            <div className="table-scroll temp-table">
              <table>
                <thead>
                  <tr>
                    <th>Fuel Name</th>
                    <th>GCV</th>
                    <th>Consumption / Hour</th>
                    <th>Direct Heat</th>
                    <th>Indirect Heat</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.fuelRows.map((row) => (
                    <tr key={`${row.name}-${row.basis}`}>
                      <td>{row.name} <span className="muted">({row.basis})</span></td>
                      <td>{fmt(row.gcv, 0)}</td>
                      <td><strong>{fmt(row.consumption, 2)} {row.unit}</strong></td>
                      <td>{fmt(row.directHeat, 2)}</td>
                      <td>{fmt(row.indirectHeat, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* <Section icon={Download} title="Heat Surface Area Check" subtitle="From the workbook section: Q = N × Surface Area × ΔT × H.">
            <div className="form-grid two-col">
              <InputField label="Required Heat" value={inputs.requiredHeat} onChange={(v) => update("requiredHeat", v)} unit="kcal/hr" />
              <InputField label="H" value={inputs.heatTransferCoefficient} onChange={(v) => update("heatTransferCoefficient", v)} unit="coef." />
              <InputField label="N / Efficiency" value={inputs.heatEfficiency} onChange={(v) => update("heatEfficiency", v)} unit="factor" />
              <InputField label="Fins Temp" value={inputs.finsTemp} onChange={(v) => update("finsTemp", v)} unit="°C" />
              <InputField label="Ambient" value={inputs.ambientTemp} onChange={(v) => update("ambientTemp", v)} unit="°C" />
              <CalcField label="Delta T" value={calc.finsDeltaT} unit="°C" formula="Fins Temp - Ambient" digits={0} />
              <CalcField label="Surface Area" value={calc.requiredSurfaceArea} unit="m²" formula="Q ÷ (H × N × ΔT)" digits={3} />
              <CalcField label="Steam Consumption" value={calc.steamForAirHeating} unit="kg/hr" formula="Rising Heat Load ÷ 630" digits={2} />
            </div>
          </Section> */}
        </div>

        {/* <Section icon={Calculator} title="Fixed Value × Quantity" subtitle="Use this section for sheet items where a fixed value is multiplied with quantity and returned as a result.">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Item / Description</th>
                  <th>Fixed Value</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Result / Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fixedSummary.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        style={{ ...tableInputStyle, minWidth: "180px" }}
                        type="text"
                        value={row.item}
                        onChange={(event) => updateFixedItem(row.id, "item", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        style={tableInputStyle}
                        type="number"
                        value={row.fixedValue}
                        onChange={(event) => updateFixedItem(row.id, "fixedValue", n(event.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        style={tableInputStyle}
                        type="number"
                        value={row.quantity}
                        onChange={(event) => updateFixedItem(row.id, "quantity", n(event.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        style={{ ...tableInputStyle, minWidth: "75px" }}
                        type="text"
                        value={row.unit}
                        onChange={(event) => updateFixedItem(row.id, "unit", event.target.value)}
                      />
                    </td>
                    <td><strong>{fmt(row.result, 2)} {row.unit}</strong></td>
                    <td>
                      <button className="btn secondary" onClick={() => removeFixedItem(row.id)} disabled={fixedItems.length === 1}>Remove</button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="4">Grand Return</td>
                  <td><strong>{fmt(fixedSummary.grandTotal, 2)}</strong></td>
                  <td>
                    <button className="btn primary" onClick={addFixedItem}>Add Row</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section> */}

        <Section id="input-data-section" icon={Calculator} title="Input Data" subtitle="All editable input fields grouped section-wise." action={
          <button className="btn primary" onClick={downloadInputSectionPdf}>
            <FileText size={16} /> Download PDF
          </button>
        }>



          <h3>Dryer Size Inputs</h3>
          <div className="form-grid five-col mb-16">
            <SelectCalcField
              label="Drying Length"
              value={inputs.dryingLengthFactor}
              onChange={(v) => update("dryingLengthFactor", v)}
              options={dryingLengthOptions}
              calculatedValue={calc.dryingLength}
              unit="m"
              formula="Selected Drying Length × Length Quantity"
              digits={3}
            />
            <InputField label="Length Quantity" value={inputs.dryingLengthQuantity} onChange={(v) => update("dryingLengthQuantity", v)} unit="nos" />
            <InputField label="Width" value={inputs.width} onChange={(v) => update("width", v)} unit="m" />
            <InputField label="Product Thickness" value={inputs.productThickness} onChange={(v) => update("productThickness", v)} unit="m" />
            <InputField label="Layer" value={inputs.layer} onChange={(v) => update("layer", v)} unit="nos" />
          </div>

          <h3>Material Inputs</h3>
          <div className="form-grid five-col mb-16">
            <InputField label="Bulk Density" value={inputs.wetProductDensity} onChange={(v) => update("wetProductDensity", v)} unit="kg/m³" />
            <InputField label="Drying Time" value={inputs.dryingTime} onChange={(v) => update("dryingTime", v)} unit="min" />
            <InputField label="Feed Material" value={inputs.feedMaterial} onChange={(v) => update("feedMaterial", v)} unit="kg/hr" />
            <InputField label="Feed Moisture" value={inputs.feedMoisture} onChange={(v) => update("feedMoisture", v)} unit="%" />
            <InputField label="Discharge Moisture" value={inputs.dischargeMoisture} onChange={(v) => update("dischargeMoisture", v)} unit="%" />
          </div>

          <h3>Heat Load Inputs</h3>
          <div className="form-grid five-col mb-16">
            <InputField label="Specific Heat of Material" value={inputs.specificHeatMaterial} onChange={(v) => update("specificHeatMaterial", v)} unit="kcal/kg°C" />
            <InputField label="Material Inlet Temp" value={inputs.materialInletTemp} onChange={(v) => update("materialInletTemp", v)} unit="°C" />
            <InputField label="Material Outlet Temp" value={inputs.materialOutletTemp} onChange={(v) => update("materialOutletTemp", v)} unit="°C" />
            <InputField label="Heat Loss Factor" value={inputs.heatLossFactor} onChange={(v) => update("heatLossFactor", v)} unit="factor" />
            <InputField label="Dry Air Temp" value={inputs.dryAirTemp} onChange={(v) => update("dryAirTemp", v)} unit="°C" />
          </div>

          <h3>Air Heating Inputs</h3>
          <div className="form-grid five-col mb-16">
            <InputField label="Air Density" value={inputs.airDensity} onChange={(v) => update("airDensity", v)} unit="kg/m³" />
            <InputField label="Initial Air Temp" value={inputs.initialAirTemp} onChange={(v) => update("initialAirTemp", v)} unit="°C" />
            <InputField label="Exhaust Temp" value={inputs.exhaustTemp} onChange={(v) => update("exhaustTemp", v)} unit="°C" />
            <InputField label="Specific Heat Air" value={inputs.specificHeatAir} onChange={(v) => update("specificHeatAir", v)} unit="kcal/kg°C" />
          </div>

        </Section>

        <footer className="footer-card">
          <span>Gem Drytech Systems LLP · Dried & Tested — Proven, not Assumed.</span>
          <span>Water {fmt(calc.waterEvaporation, 1)} kg/hr · Heat {fmt(calc.totalHeatLoad, 0)} kcal/hr · Air {fmt(calc.airVolume, 0)} CMH</span>
        </footer>
      </main>
    </div>
  );
}
