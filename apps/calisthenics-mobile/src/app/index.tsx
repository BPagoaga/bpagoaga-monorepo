import { Badge, Button, Card, Text, space } from '@bpagoaga/ui-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text variant="body-s" weight={600} color="accent-110" style={styles.eyebrow}>
          Bientôt
        </Text>
        <Text variant="title-xl">Calisthénie</Text>
        <Text color="muted">
          Tutoriels, récapitulatifs de performance et journal de séances, dans la poche entre deux séries.
        </Text>
      </View>

      <Card>
        <Badge label="Design system" tone="primary" />
        <Text variant="title-m">@bpagoaga/ui-native</Text>
        <Text variant="body-s" color="muted">
          Composants React Native construits sur les tokens de @bpagoaga/ui : couleurs, typographie, rayons et
          élévations.
        </Text>
        <View style={styles.badges}>
          <Badge label="Tirage" tone="blue" />
          <Badge label="Poussée" tone="orange" />
          <Badge label="Record" tone="green" />
        </View>
        <View style={styles.actions}>
          <Button label="Commencer une séance" />
          <Button label="Voir les tutoriels" variant="secondary" />
        </View>
      </Card>
    </ScrollView>
  </SafeAreaView>
);

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: space(6),
    padding: space(6),
  },
  intro: {
    gap: space(3),
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2),
  },
  actions: {
    gap: space(3),
    marginTop: space(2),
  },
});
