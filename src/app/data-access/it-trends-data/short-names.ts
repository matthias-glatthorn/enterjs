const shortNames = {
  "Künstliche Intelligenz/ Machine Learning": "KI/ ML",
  "Augmented/ Virtual Reality": "AR/ VR",
  "Big Data": "Big Data",
  "Nachhaltigkeit und umweltfreundliche Technologien": "Green Tech",
  "Internet of Things": "IoT",
  "Cyber Security": "CS"
};

export function getShortName(groupName: string) {
  return shortNames[groupName as keyof typeof shortNames] ?? 'n.a.'
}