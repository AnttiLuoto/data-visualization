import React, {useEffect, useState} from "react";
import BarChart from "./components/BarChart.jsx";
import BarChart_test from "./components/BarChart_test.jsx";
import DropDown from "./components/Dropdown.jsx";
import PriceHistoryLine from "./components/PriceHistoryLine.jsx";
import PriceHistoryLinePercentage from "./components/PriceHistoryLinePercentage.jsx";

function App() {

    // Variables for D_Product and F_PriceHistory
    const [priceHistory, setPriceHistory] = useState([]) // List of objects
    const [products, setProducts] = useState([]) // List of products
    const [productNames, setProductNames] = useState([]) // Product names for the dropdown

    // Variables for selected items
    const [selectedProduct, setSelectedProduct] = useState('')


    // Load in the data
    useEffect(() => {

        // PriceHistory
        fetch('./data/F_PriceHistory.json')
            .then(response => response.json())
            .then(data => {
                setPriceHistory(data)
            })
            .catch(error => console.error('Error fetching PriceHistory: ', error));

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
        <div className="p-5 bg-gray-900 min-h-screen text-white">
            <div className="mb-5">
                <h1 className="text-3xl font-bold text-center">Data Visualization with D3</h1>
            </div>
            <div className='flex flex-row'>
                <div className='flex-col w-64 border-r-2'>
                    Sidepanel
                    <div className="col-span-1 mb-10">
                        <DropDown items={productNames} onItemSelect={handleProductSelect}/>
                    </div>
                    <div className="col-span-1 mb-10">
                        <DropDown items={productNames} onItemSelect={handleProductSelect}/>
                    </div>
                </div>
                {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                <div className="grid grid-cols-2 ">
                    <div className="col-span-1">
                        {priceHistory.length > 0 ?
                            <PriceHistoryLine data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                            <p>Loading data...</p>}
                    </div>
                    <div className="col-span-1">
                        {priceHistory.length > 0 ?
                            <PriceHistoryLinePercentage data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                            <p>Loading data...</p>}
                    </div>
                    <div className="col-span-1">
                        {priceHistory.length > 0 ?
                            <PriceHistoryLine data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                            <p>Loading data...</p>}
                    </div>
                    <div className="col-span-1">
                        {priceHistory.length > 0 ?
                            <PriceHistoryLine data={filteredPriceHistory} selectedProduct={selectedProduct}/> :
                            <p>Loading data...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
