const fs = require('fs');
let content = fs.readFileSync('app/(drawer)/account.tsx', 'utf8');

const imports = \import Settings01 from '@/assets/icons/pikaicons/settings-01.svg';
import AwardMedal from '@/assets/icons/pikaicons/award-medal.svg';
import FolderDefault from '@/assets/icons/pikaicons/folder-default.svg';
import ClockDefault from '@/assets/icons/pikaicons/clock-default.svg';
import BookmarkDefault from '@/assets/icons/pikaicons/bookmark-default.svg';
import File02Default from '@/assets/icons/pikaicons/file-02-default.svg';
import Troubleshoot from '@/assets/icons/pikaicons/troubleshoot.svg';\n\;
content = content.replace(/import \{ AnimatedIcon \} from '@\/components\/ui\/AnimatedIcon';/, \import { AnimatedIcon } from '@/components/ui/AnimatedIcon';\n\ + imports);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-setting-front-color\\.png'\\)\\}\\s*size=\\{28\\}\\s*animationType="spin"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/settings' as any\\)\\}\\s*style=\\{s\\.iconBtn\\}\\s*\\/>/m,
  \<AnimatedIcon size={28} animationType="spin" onPress={() => router.push('/(drawer)/settings' as any)} style={[s.iconBtn, {alignItems: 'center', justifyContent: 'center'}]}>
                              <Settings01 width={24} height={24} color={C.text} />
                          </AnimatedIcon>\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-fire-iso-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="pop"\\s*onPress=\\{\\(\\) => \\{\\s*\\/\\/ Provide empty onPress to enable animation\\s*\\}\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="pop" onPress={() => {}}>
                            <AwardMedal width={40} height={40} color="#FF3B30" style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-folder-front-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="wobble"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/flashcards' as any\\)\\}\\s*style=\\{\\{ width: '100%', alignItems: 'center' \\}\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="wobble" onPress={() => router.push('/(drawer)/flashcards' as any)} style={{ width: '100%', alignItems: 'center' }}>
                            <FolderDefault width={40} height={40} color={C.primary} style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-clock-front-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="twist"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/history' as any\\)\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="twist" onPress={() => router.push('/(drawer)/history' as any)} style={{ width: '100%', alignItems: 'center' }}>
                            <ClockDefault width={40} height={40} color={C.primary} style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-bookmark-fav-front-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="pop"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/history\\/saved' as any\\)\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="pop" onPress={() => router.push('/(drawer)/history/saved' as any)} style={{ width: '100%', alignItems: 'center' }}>
                            <BookmarkDefault width={40} height={40} color="#34C759" style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/38135f41-3512-406e-9795-abe38150a9b7_removalai_preview\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="twist"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/generate' as any\\)\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="twist" onPress={() => router.push('/(drawer)/generate' as any)} style={{ width: '100%', alignItems: 'center' }}>
                            <File02Default width={40} height={40} color="#007AFF" style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-boy-front-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="spin"\\s*onPress=\\{\\(\\) => router\\.push\\('\\/\\(drawer\\)\\/support' as any\\)\\}\\s*style=\\{\\{ width: '100%', alignItems: 'center' \\}\\}\\s*>/m,
  \<AnimatedIcon size={56} animationType="spin" onPress={() => router.push('/(drawer)/support' as any)} style={{ width: '100%', alignItems: 'center' }}>
                            <Troubleshoot width={40} height={40} color="#FF9500" style={{marginBottom: 8}} />\
);

content = content.replace(
  /<AnimatedIcon\\s*source=\\{require\\('@\\/assets\\/3dicons\\/3dicons-setting-front-color\\.png'\\)\\}\\s*size=\\{56\\}\\s*animationType="spin"\\s*\\/>/m,
  \<AnimatedIcon size={56} animationType="spin">
                            <Settings01 width={40} height={40} color={C.text} />
                        </AnimatedIcon>\
);

fs.writeFileSync('app/(drawer)/account.tsx', content);
console.log('Account updated');
