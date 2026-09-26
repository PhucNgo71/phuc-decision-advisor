'use client';

import { useMemo, useState } from 'react';
import commercialRules from '../data/commercial-rules.json';

type CostUnit = 'pcs' | 'sqm';
type ProductCostLine = {
  id: number;
  description: string;
  code: string;
  quantity: number;
  unit: CostUnit;
  unitCost: number;
  cbmPerUnit: number;
  logisticsPerCbm: number;
  inlandPerCbm: number;
  importTaxRate: number;
  installPerUnit: number;
};

const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const newLine = (id: number): ProductCostLine => ({
  id,
  description: '',
  code: '',
  quantity: 1,
  unit: 'pcs',
  unitCost: 0,
  cbmPerUnit: 0,
  logisticsPerCbm: 0,
  inlandPerCbm: 0,
  importTaxRate: 0,
  installPerUnit: 0,
});

export default function ProductCostCalculator() {
  const hardFloor = commercialRules.hard_rules[0].value * 100;
  const [targetMargin, setTargetMargin] = useState(30);
  const [lines, setLines] = useState<ProductCostLine[]>([newLine(1)]);

  const updateLine = <K extends keyof ProductCostLine>(
    id: number,
    field: K,
    value: ProductCostLine[K],
  ) => {
    setLines((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addLine = () => {
    setLines((items) => [
      ...items,
      newLine(Math.max(0, ...items.map((item) => item.id)) + 1),
    ]);
  };

  const removeLine = (id: number) => {
    setLines((items) =>
      items.length > 1 ? items.filter((item) => item.id !== id) : items,
    );
  };

  const result = useMemo(() => {
    const marginRate = Math.min(Math.max(targetMargin / 100, 0), 0.95);
    const products = lines.map((line) => {
      const productCost = line.quantity * line.unitCost;
      const totalCbm = line.quantity * line.cbmPerUnit;
      const logisticsCost = totalCbm * line.logisticsPerCbm;
      const inlandCost = totalCbm * line.inlandPerCbm;
      const customsPlanningBase = productCost + logisticsCost;
      const importTax = customsPlanningBase * (line.importTaxRate / 100);
      const installationCost = line.quantity * line.installPerUnit;
      const totalCost =
        productCost +
        logisticsCost +
        inlandCost +
        importTax +
        installationCost;
      const sellingPrice = totalCost > 0 ? totalCost / (1 - marginRate) : 0;
      const profit = sellingPrice - totalCost;
      return {
        ...line,
        productCost,
        totalCbm,
        logisticsCost,
        inlandCost,
        importTax,
        installationCost,
        totalCost,
        sellingPrice,
        profit,
      };
    });

    return {
      products,
      totalCost: products.reduce((sum, item) => sum + item.totalCost, 0),
      sellingPrice: products.reduce((sum, item) => sum + item.sellingPrice, 0),
      profit: products.reduce((sum, item) => sum + item.profit, 0),
      totalCbm: products.reduce((sum, item) => sum + item.totalCbm, 0),
    };
  }, [lines, targetMargin]);

  return (
    <details className="product-cost-tool" id="product-cost-calculator">
      <summary>
        <div>
          <span>Optional tool</span>
          <b>Open product costing</b>
          <small>Landed cost, selling price and profit for any product</small>
        </div>
        <i aria-hidden="true">+</i>
      </summary>

      <div className="product-cost-body">
        <div className="costing-intro">
          <div>
            <span>PRODUCT COSTING PROCESS</span>
            <h3>Build the complete landed cost</h3>
            <p>
              Add one or more products. Freight is calculated from total CBM;
              delivery and installation follow the selected pcs or sqm unit.
            </p>
          </div>
          <label>
            Target gross margin
            <div>
              <input
                type="number"
                min="0"
                max="95"
                step="0.5"
                value={targetMargin}
                onChange={(event) => setTargetMargin(Number(event.target.value))}
              />
              <span>%</span>
            </div>
            <small className={targetMargin < hardFloor ? 'cost-warning' : ''}>
              Hard floor: {hardFloor.toFixed(0)}%
            </small>
          </label>
        </div>

        <div className="product-cost-list">
          {result.products.map((line, index) => (
            <article className="product-cost-card" key={line.id}>
              <header>
                <div>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <b>{line.description || 'New product'}</b>
                    <small>{line.code || 'Add description and product code'}</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  aria-label={'Remove product ' + (index + 1)}
                >
                  Remove
                </button>
              </header>

              <div className="product-cost-fields">
                <label className="field-wide">
                  Product description
                  <input
                    value={line.description}
                    placeholder="Example: Task chair"
                    onChange={(event) =>
                      updateLine(line.id, 'description', event.target.value)
                    }
                  />
                </label>
                <label>
                  Product code
                  <input
                    value={line.code}
                    placeholder="SKU / model"
                    onChange={(event) =>
                      updateLine(line.id, 'code', event.target.value)
                    }
                  />
                </label>
                <label>
                  Quantity / area
                  <input
                    type="number"
                    min="0"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.id, 'quantity', Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Costing unit
                  <select
                    value={line.unit}
                    onChange={(event) =>
                      updateLine(line.id, 'unit', event.target.value as CostUnit)
                    }
                  >
                    <option value="pcs">pcs</option>
                    <option value="sqm">sqm</option>
                  </select>
                </label>
                <label>
                  Base product cost / {line.unit}
                  <input
                    type="number"
                    min="0"
                    value={line.unitCost}
                    onChange={(event) =>
                      updateLine(line.id, 'unitCost', Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  CBM / {line.unit}
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={line.cbmPerUnit}
                    onChange={(event) =>
                      updateLine(line.id, 'cbmPerUnit', Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Logistics cost / CBM
                  <input
                    type="number"
                    min="0"
                    value={line.logisticsPerCbm}
                    onChange={(event) =>
                      updateLine(
                        line.id,
                        'logisticsPerCbm',
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
                <label>
                  Inland logistics / CBM
                  <input
                    type="number"
                    min="0"
                    value={line.inlandPerCbm}
                    onChange={(event) =>
                      updateLine(line.id, 'inlandPerCbm', Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Import tax
                  <div className="suffix-input">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={line.importTaxRate}
                      onChange={(event) =>
                        updateLine(
                          line.id,
                          'importTaxRate',
                          Number(event.target.value),
                        )
                      }
                    />
                    <span>%</span>
                  </div>
                </label>
                <label>
                  Delivery / installation / {line.unit}
                  <input
                    type="number"
                    min="0"
                    value={line.installPerUnit}
                    onChange={(event) =>
                      updateLine(
                        line.id,
                        'installPerUnit',
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              </div>

              <div className="product-cost-breakdown">
                <div><small>Product</small><b>{money.format(line.productCost)}</b></div>
                <div><small>Total CBM</small><b>{line.totalCbm.toFixed(3)}</b></div>
                <div><small>International logistics</small><b>{money.format(line.logisticsCost)}</b></div>
                <div><small>Inland logistics</small><b>{money.format(line.inlandCost)}</b></div>
                <div><small>Import tax</small><b>{money.format(line.importTax)}</b></div>
                <div><small>Delivery / installation</small><b>{money.format(line.installationCost)}</b></div>
                <div className="cost-total"><small>Total cost</small><b>{money.format(line.totalCost)}</b></div>
                <div className="cost-price"><small>Target selling price</small><b>{money.format(line.sellingPrice)}</b></div>
                <div className="cost-profit"><small>Gross profit</small><b>{money.format(line.profit)}</b></div>
              </div>
            </article>
          ))}
        </div>

        <button className="add-product-cost" type="button" onClick={addLine}>
          + Add another product
        </button>

        <div className="product-cost-summary">
          <div><small>Total CBM</small><b>{result.totalCbm.toFixed(3)}</b></div>
          <div><small>Total landed cost</small><b>{money.format(result.totalCost)}</b></div>
          <div><small>Target selling price</small><b>{money.format(result.sellingPrice)}</b></div>
          <div><small>Estimated gross profit</small><b>{money.format(result.profit)}</b></div>
        </div>

        <div className="costing-formula">
          <b>Formula</b>
          <span>
            Selling price = total cost ÷ (100% − target margin). Profit = selling
            price − total cost.
          </span>
          <small>
            Import tax uses product cost plus international logistics as a planning
            base. Confirm HS code, customs value, recoverable VAT and current tax
            treatment before quoting.
          </small>
        </div>
      </div>
    </details>
  );
}
