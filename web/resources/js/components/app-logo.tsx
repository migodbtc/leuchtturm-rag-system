import { BrainCircuit } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <BrainCircuit className="text-orange-400" size={26} />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span
                    className="truncate bg-clip-text text-base font-bold leading-none tracking-wide text-transparent"
                    style={{
                        backgroundImage: 'linear-gradient(to right, rgb(180, 83, 9), rgb(255, 120, 56), rgb(253, 224, 71))',
                    }}
                >
                    LEUCHTTURM
                </span>
            </div>
        </>
    );
}
