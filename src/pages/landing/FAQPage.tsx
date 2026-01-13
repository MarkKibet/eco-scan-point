import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingLayout from '@/components/landing/LandingLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, MessageCircle } from 'lucide-react';

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I sign up for TakaTrace?',
        answer: 'Signing up is simple and free! Click the "Get Started" button, enter your email address, create a password, and provide basic information about your household. You can start using TakaTrace immediately after verification.',
      },
      {
        question: 'Is TakaTrace free to use?',
        answer: 'Yes! TakaTrace is completely free for households. You can sign up, track your waste, and earn rewards without any cost. We generate revenue through partnerships with municipalities and organizations.',
      },
      {
        question: 'How do I get the color-coded bags?',
        answer: 'Once registered, you can request bags through the app. Depending on your location, bags may be delivered to you or available for pickup at designated distribution points. Check your local availability in the app.',
      },
      {
        question: 'Can my whole family use one account?',
        answer: 'Absolutely! You can add family members to your household account. Everyone contributes to the same points pool, and you can track individual contributions while sharing rewards.',
      },
    ],
  },
  {
    category: 'Using the App',
    questions: [
      {
        question: 'How do I scan a QR code?',
        answer: 'Open the TakaTrace app and tap the scan button on the home screen. Point your camera at the QR code on your bag and it will automatically detect and activate the bag. Make sure you have good lighting for best results.',
      },
      {
        question: 'What if the QR code scan fails?',
        answer: 'If the scan fails, try adjusting the lighting or distance from the code. You can also manually enter the code printed below the QR code. If problems persist, contact our support team.',
      },
      {
        question: 'How does the AI waste scanner work?',
        answer: 'The AI scanner uses image recognition to identify items and suggest the correct bag type. Simply take a photo of an item, and our AI will analyze it and provide sorting recommendations. It learns and improves over time!',
      },
      {
        question: 'Can I use TakaTrace offline?',
        answer: 'Basic features like viewing your history and rewards are available offline. However, scanning bags and syncing data requires an internet connection. Your scans will be queued and processed once you reconnect.',
      },
    ],
  },
  {
    category: 'Bags & Sorting',
    questions: [
      {
        question: 'What goes in each bag color?',
        answer: 'Blue bags are for recyclables (plastic, paper, metal, glass). Green bags are for biodegradables (food scraps, yard waste). Black bags are for residual waste (items that cannot be recycled or composted). Check our sorting guide in the app for detailed lists.',
      },
      {
        question: "What if I'm not sure where something goes?",
        answer: 'Use our AI scanner to get recommendations. When in doubt, it is safer to place items in the black residual bag to avoid contaminating recyclables. You can also check our comprehensive sorting guide in the app.',
      },
      {
        question: 'Do I need to clean containers before recycling?',
        answer: 'Yes! Containers should be rinsed to remove food residue. They do not need to be spotless, but excessive food contamination can cause an entire batch of recyclables to be rejected.',
      },
      {
        question: 'What happens if my bag is rejected?',
        answer: 'If a collector finds contamination or improper sorting, the bag may be rejected and you will not receive points for that bag. You will get feedback on what went wrong so you can improve next time.',
      },
    ],
  },
  {
    category: 'Points & Rewards',
    questions: [
      {
        question: 'How are points calculated?',
        answer: 'Points are awarded based on bag type when approved: Blue recyclable bags earn 15 points, green biodegradable bags earn 5 points, and black residual bags earn 1 point. Proper sorting is required to receive points.',
      },
      {
        question: 'When do I receive my points?',
        answer: 'Points are credited to your account once a collector scans your bag and approves it. This typically happens during regular collection. You will receive a notification when points are added.',
      },
      {
        question: 'What can I redeem points for?',
        answer: 'Points can be redeemed for various rewards including shopping vouchers, mobile airtime, discounts at partner stores, and more. The available rewards vary by location and are constantly being updated.',
      },
      {
        question: 'Do points expire?',
        answer: 'Points remain valid for 12 months from the date earned. We recommend redeeming points regularly to enjoy your rewards. You will receive reminders before any points are about to expire.',
      },
    ],
  },
  {
    category: 'Collection & Processing',
    questions: [
      {
        question: 'How often is waste collected?',
        answer: 'Collection frequency varies by location. Most areas have weekly collection. Check your collection schedule in the app for specific days and times in your area.',
      },
      {
        question: 'How do I know when collection is happening?',
        answer: 'The app shows your scheduled collection days. You can also enable notifications to receive reminders before collection day and updates when collectors are in your area.',
      },
      {
        question: 'What happens to the waste after collection?',
        answer: 'Recyclables are sent to recycling facilities, biodegradables go to composting centers, and residuals are disposed of responsibly. You can track the journey of your waste in the app to see its final destination.',
      },
      {
        question: 'Can I request an extra collection?',
        answer: 'Special collections may be available for large items or extra waste. Check the app for special collection requests in your area, which may have additional requirements or fees.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about TakaTrace. Cannot find what you are looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12 last:mb-0">
                <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-border rounded-xl px-6 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our support team is here to help. Reach out and we will get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="font-semibold shadow-eco-lg px-8">
                  Contact Support
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="font-semibold px-8">
                  View Tutorials
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
