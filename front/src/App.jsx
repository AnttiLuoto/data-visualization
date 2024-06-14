import React, {useEffect, useState} from "react";
import BarChart from "./components/BarChart.jsx";
import BarChart_test from "./components/BarChart_test.jsx";
import DropDown from "./components/Dropdown.jsx";
import PriceHistoryLine from "./components/PriceHistoryLine.jsx";
import PriceHistoryLinePercentage from "./components/PriceHistoryLinePercentage.jsx";
import PriceChangeBar from "./components/PriceChangeBar.jsx";
import PriceChangeLine from "./components/PriceChangeLineAll.jsx";
import PriceChangeLineAll from "./components/PriceChangeLineAll.jsx";

function App() {

    // Variables for D_Product and F_PriceHistory
    const [priceHistory, setPriceHistory] = useState([])
    const [priceHistoryQuantiles, setPriceHistoryQuantiles] = useState([])
    const [productAggregates, setProductAggregates] = useState([])
    const [products, setProducts] = useState([])
    const [productNames, setProductNames] = useState([]) // Product names for the dropdown

    // Variables for selected items
    const [selectedProduct, setSelectedProduct] = useState('')

    const col = "#f3f8f8"
    // Load in the data
    useEffect(() => {

        // PriceHistory
        fetch('./data/F_PriceHistory.json')
            .then(response => response.json())
            .then(data => {
                setPriceHistory(data)
            })
            .catch(error => console.error('Error fetching PriceHistory: ', error));

        // PriceHistoryQuantiles
        fetch('./data/F_PriceHistoryQuantiles.json')
            .then(response => response.json())
            .then(data => {
                setPriceHistoryQuantiles(data)
            })
            .catch(error => console.error('Error fetching PriceHistoryQuantiles: ', error));

        // Product aggretes
        fetch('./data/F_ProductAggregates.json')
            .then(response => response.json())
            .then(data => {
                setProductAggregates(data)
                setSelectedProduct(data[5]['productName'])
            })
            .catch(error => console.error('Error fetching ProductAggregates: ', error));

        // Products
        fetch('./data/D_Product.json')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                // Extract product names for dropdown selection
                const names = data.map(product => product.productName);
                setProductNames(names);
            })
            .catch(error => console.error('Error fetching Products: ', error));
    }, []);

    const handleProductSelect = (item) => {
        setSelectedProduct(item)
        console.log("handleProductSelect triggered: ", item)
    }

    // Filter the priceHistory -array based on selectedProduct to plot only data of selectedProduct
    const filteredPriceHistory = selectedProduct
        ? priceHistory.filter(record => record.productName === selectedProduct)
        : [];

    return (
        <div className="p-5 bg-white min-h-screen text-gray-900">
            <div className='flex flex-row'>
                <div className='flex flex-col w-64 border-r-2 p-4'>
                    <h2 className="font-semibold mb-4">Product Selection</h2>
                    <div className="mb-10">
                        <DropDown items={productNames} onItemSelect={handleProductSelect}/>
                    </div>
                </div>
                <div className="flex flex-col flex-1 pl-4 w-[1600px]">
                    <div className="w-[1600px]">
                        <div className="flex justify-center shadow-md rounded-md bg-[#F3F8F8FF] mb-10">
                            {priceHistory.length > 0 ?
                                <PriceChangeBar data={productAggregates} selectedProduct={selectedProduct} onBarClick={handleProductSelect}/> :
                                <p>Loading data...</p>}
                        </div>
                        <div className="grid gap-10 grid-cols-2 mb-10">
                            {/* PriceHistoryLine and PriceHistoryPercentage should be below PriceChangeBar, and be one col wide */}
                            <div className="flex justify-center col-span-1 shadow-md rounded-md bg-[#F3F8F8FF]">
                                {priceHistory.length > 0 ?
                                    <PriceHistoryLine data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                                    <p>Loading data...</p>}
                            </div>
                            <div className="flex justify-center col-span-1 shadow-md rounded-md bg-[#F3F8F8FF]">
                                {priceHistory.length > 0 ?
                                    <PriceHistoryLinePercentage data={filteredPriceHistory}
                                                                selectedProduct={selectedProduct}/> :
                                    <p>Loading data...</p>}
                            </div>
                        </div>
                        <div className="flex justify-center shadow-md rounded-md bg-[#F3F8F8FF] mb-10">
                            {priceHistory.length > 0 ?
                                <PriceChangeLineAll priceHistory={priceHistory}
                                                    priceHistoryQuantiles={priceHistoryQuantiles}
                                                    selectedProduct={selectedProduct}
                                                    onBarClick={handleProductSelect}/> :
                                <p>Loading data...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
