export default function CurrentPage() {
    return (
        <div className="page-container">
            {/* Hero Section */}
            <div className="section py-16">
                <h1 className="text-4xl font-bold mb-6">About Us</h1>
                <p className="text-xl w-full mx-auto leading-relaxed">
                    We're a team of passionate developers dedicated to making social media content accessible to everyone.
                </p>
            </div>

            {/* Company Story */}
            <div className="section">
                <div className="w-full mx-auto">
                    <p className="text-lg leading-relaxed mb-6">
                        TwitterXDownload was founded in 2022 by a group of tech enthusiasts who were frustrated with the limitations of downloading content from Twitter (now X). What started as a simple side project has grown into a trusted platform used by millions of users worldwide.
                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                        Our mission is to provide a seamless, user-friendly experience for downloading Twitter videos and media content. We believe that content creators should have the ability to save and share their work across different platforms without restrictions.
                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                        Unlike other services, we've built TwitterXDownload with privacy and user experience in mind. We don't collect unnecessary data, we don't require registration, and we don't bombard users with ads. Our focus is solely on providing the best possible download experience.
                    </p>
                    <p className="text-lg leading-relaxed">
                        As Twitter continues to evolve, we're committed to staying ahead of the curve and ensuring our service remains reliable and efficient. Our team of developers works tirelessly to update our algorithms and maintain compatibility with the latest Twitter features.
                    </p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="section mb-12">
                <div className="w-full mx-auto flex justify-between gap-8">
                    <div className=" bg-foreground/5 rounded-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-lg leading-relaxed">
                            To empower users with the ability to download and save Twitter content easily, while respecting privacy and maintaining a seamless user experience.
                        </p>
                    </div>
                    <div className="bg-foreground/5 rounded-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                        <p className="text-lg leading-relaxed">
                            To become the most trusted and reliable platform for downloading social media content, setting industry standards for simplicity and efficiency.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Impact */}
            <div className="section mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">5M+</div>
                        <div className="text-lg text-gray-600">Downloads</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
                        <div className="text-lg text-gray-600">Countries</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                        <div className="text-lg text-gray-600">Uptime</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                        <div className="text-lg text-gray-600">Support</div>
                    </div>
                </div>
            </div>

            {/* Meet Our Team */}
            <div className="section">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
                </div>
                <div className="flex gap-8">
                    <div className="flex-1 text-center p-8 rounded-lg">
                        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">AJ</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Alex Johnson</h3>
                        <p className="text-blue-600 font-semibold mb-3">Founder & CEO</p>
                        <p className="text-gray-600 leading-relaxed">
                            With over 10 years of experience in software development, Alex leads our team with passion and innovation.
                        </p>
                    </div>
                    <div className="flex-1 text-center p-8 rounded-lg">
                        <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">SC</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sarah Chen</h3>
                        <p className="text-green-600 font-semibold mb-3">Lead Developer</p>
                        <p className="text-gray-600 leading-relaxed">
                            Sarah specializes in backend development and API integration, ensuring our service runs smoothly.
                        </p>
                    </div>
                    <div className="flex-1 text-center p-8 rounded-lg">
                        <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-purple-600">MR</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Michael Rodriguez</h3>
                        <p className="text-purple-600 font-semibold mb-3">UI/UX Designer</p>
                        <p className="text-gray-600 leading-relaxed">
                            Michael creates intuitive and beautiful interfaces that make our service a joy to use.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}