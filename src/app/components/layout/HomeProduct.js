import Right from "../icons/Right"
import ProductItem from '../product/ProductItem';

export default function HomeProduct() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Featured Products
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Discover our cutting-edge solutions for edge computing and AI acceleration
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <ProductItem
                            name="Qualcomm QCS6490"
                            image="/qc01.jpg"
                            description="High-performance Qualcomm 6490 processor for advanced mobile computing"
                            features={[
                                "Octa-core CPU",
                                "Integrated WIFI modem",
                                "AI acceleration"
                            ]}
                        />
                    </div>

                    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <ProductItem
                            name="NVIDIA Jetson"
                            image="/psox.jpg"
                            description="Powerful NVIDIA Jetson platform for AI and robotics applications"
                            features={[
                                "GPU-accelerated computing",
                                "Deep learning optimized",
                                "Real-time processing"
                            ]}
                        />
                    </div>

                    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <ProductItem
                            name="Industrial AI Tablet"
                            image="/53r.jpg"
                            description="Rugged industrial tablet with integrated AI acceleration"
                            features={[
                                "Durable design",
                                "Touch interface",
                                "Edge AI processing"
                            ]}
                        />
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="/product"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-red-700 transition-colors duration-200"
                    >
                        View All Products
                        <Right className="ml-2 h-5 w-5" />
                    </a>
                </div>
            </div>
        </section>
    );
}